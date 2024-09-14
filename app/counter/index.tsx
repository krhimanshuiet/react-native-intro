import { Duration, intervalToDuration, isBefore } from "date-fns";
import * as Device from "expo-device";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";
import { TimeSegment } from "../../components/time-segment";
import { registerForPushNotificationsAsync } from "../../utils/registerForPushNotificationsAsync";
import { getFromStorage, saveToStorage } from "../../utils/storage";
import { theme } from "../../utils/theme";

const frequncy = 14 * 24 * 60 * 60 * 1000;

export const CountDownStorageKey = "taskly-countdown";

export type PersistedCountdownState = {
  currentNotificationId: string | undefined;
  completedAtTimestamps: number[];
}

type CountDownStatus = {
  isOverdue: boolean;
  distance: Duration
}

export default function CounterScreen() {
  const { width } = useWindowDimensions()
  const [isLoading, setIsLoading] = useState(true)
  const [countdownState, setCountdownState] = useState<PersistedCountdownState>()
  const [status, setStatus] = useState<CountDownStatus>({
    isOverdue: false,
    distance: {}
  })
  const confettiRef = useRef<any>()

  const lastCompletedTimestamp = countdownState?.completedAtTimestamps[0];

  useEffect(() => {
    const init = async () => {
      const value = await getFromStorage(CountDownStorageKey);
      setCountdownState(value)
    }
    init();
  }, [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeStamp = lastCompletedTimestamp ? lastCompletedTimestamp + frequncy : Date.now();
      if (lastCompletedTimestamp) {
        setIsLoading(false)
      }
      const isOverdue = isBefore(timeStamp, Date.now());
      const distance = intervalToDuration(isOverdue ? {
        start: timeStamp,
        end: Date.now()
      } : {
        start: Date.now(),
        end: timeStamp

      })
      setStatus({ isOverdue, distance })
    }, 1000)

    return () => {
      clearInterval(intervalId);
    }
  }, [lastCompletedTimestamp])
  const handleRequestPermission = async () => {
    confettiRef?.current?.start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    let pushNotificationId;
    const result = await registerForPushNotificationsAsync();
    if (result === "granted") {
      pushNotificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: "This Thing is due!"
        },
        trigger: {
          seconds: frequncy / 1000
        }
      })
    }
    else {
      if (Device.isDevice) {
        Alert.alert("Unable to shedule notification", "Enable the notification permission for Expo Go in Settings.")
      }
    }
    if (countdownState?.currentNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(countdownState?.currentNotificationId)
    }
    const newCountdownState: PersistedCountdownState = {
      currentNotificationId: pushNotificationId,
      completedAtTimestamps: countdownState ? [Date.now(), ...countdownState.completedAtTimestamps] : [Date.now()]
    }
    setCountdownState(newCountdownState)
    await saveToStorage(CountDownStorageKey, countdownState)
    console.log("result", result)
  }

  if (isLoading) {
    return (
      <View style={styles.activityContainer}>
        <ActivityIndicator />
      </View>
    )
  }

  return (
    <View style={[styles.container, status.isOverdue ? styles.overdue : undefined]}>

      {
        status.isOverdue ? <Text style={[styles.heading, styles.whiteText]}>Thing overdue by</Text> : <Text style={styles.heading}>This due in..</Text>
      }
      <View style={styles.row}>
        <TimeSegment unit="Days" number={status.distance.days ?? 0} textStyle={status.isOverdue ? styles.whiteText : undefined} />
        <TimeSegment unit="Hours" number={status.distance.hours ?? 0} textStyle={status.isOverdue ? styles.whiteText : undefined} />
        <TimeSegment unit="Minutes" number={status.distance.minutes ?? 0} textStyle={status.isOverdue ? styles.whiteText : undefined} />
        <TimeSegment unit="Seconds" number={status.distance.seconds ?? 0} textStyle={status.isOverdue ? styles.whiteText : undefined} />
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={handleRequestPermission} style={styles.button}>
        <Text style={styles.buttonText}>I have done the thing!</Text>
      </TouchableOpacity>
      <ConfettiCannon
        ref={confettiRef}
        count={50}
        origin={{ x: width / 2, y: -20 }}
        autoStart
        fadeOut={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  text: {
    color: theme.colorBlack
  },
  buttonText: {
    fontSize: 24,
    color: theme.colorWhite,
    fontWeight: 'bold',
    textTransform: "uppercase",
    letterSpacing: 1
  },
  button: {
    backgroundColor: theme.colorBlack,
    padding: 12,
    borderRadius: 6,
  },
  row: {
    flexDirection: "row",
    marginBottom: 24
  },
  overdue: {
    backgroundColor: theme.colorRed
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: theme.colorBlack
  },
  whiteText: {
    color: theme.colorWhite
  },
  activityContainer: {
    backgroundColor: theme.colorWhite,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  }
});
