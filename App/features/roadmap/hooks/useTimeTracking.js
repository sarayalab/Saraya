import {
  doc,
  updateDoc,
  increment,
  arrayUnion,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { auth, db } from "../../../../firebase";

// Track time spent on different activities
export const trackTimeSpent = async (
  activityType,
  activityId,
  timeSpentInSeconds
) => {
  try {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return;
    }

    // Update overall time spent
    await updateDoc(userDocRef, {
      [`timeSpent.${activityType}.totalSeconds`]: increment(timeSpentInSeconds),
    });

    // If we have a specific activity ID, update that as well
    if (activityId) {
      await updateDoc(userDocRef, {
        [`timeSpent.${activityType}.byId.${activityId}`]:
          increment(timeSpentInSeconds),
      });
    }

    // Create a time-based bucket for detailed logs
    // e.g., one document per month
    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;

    const timeLogRef = doc(db, "users", uid, "timeLogs", yearMonth);
    const timeLogDoc = await getDoc(timeLogRef);

    if (!timeLogDoc.exists()) {
      // Create new month document
      await setDoc(timeLogRef, {
        activities: [
          {
            type: activityType,
            id: activityId || "general",
            timestamp: now.toISOString(),
            duration: timeSpentInSeconds,
          },
        ],
      });
    } else {
      // Update existing month document
      await updateDoc(timeLogRef, {
        activities: arrayUnion({
          type: activityType,
          id: activityId || "general",
          timestamp: now.toISOString(),
          duration: timeSpentInSeconds,
        }),
      });
    }

    console.log(`Tracked ${timeSpentInSeconds} seconds for ${activityType}`);
  } catch (error) {
    console.error("Error tracking time spent:", error);
  }
};

// Initialize time tracking for a screen/section
export const useTimeTracking = (activityType, activityId) => {
  let startTime = Date.now();

  const trackEndTime = async () => {
    const endTime = Date.now();
    const timeSpentInSeconds = Math.floor((endTime - startTime) / 1000);

    if (timeSpentInSeconds > 1) {
      // Only track if spent more than 1 second

      await trackTimeSpent(activityType, activityId, timeSpentInSeconds);
    }
  };

  return { trackEndTime };
};
