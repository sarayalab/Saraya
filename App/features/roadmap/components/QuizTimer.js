import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import tw from "twrnc";

// Create context with additional pause functionality
const TimerContext = createContext({
  timeSpent: 0,
  formatTimeSpent: () => {},
  pauseTimer: () => {},
  resumeTimer: () => {},
});

// Provider component
export const QuizTimerProvider = ({ children }) => {
  const [timeSpent, setTimeSpent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeRef = useRef(0);
  const intervalRef = useRef(null);
  const pausedRef = useRef(false); // Use ref to track pause state for interval

  // Format time spent in MM:SS format
  const formatTimeSpent = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(remainingSeconds).padStart(2, "0");

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // Start the timer
  const startTimer = () => {
    if (intervalRef.current) return; // Prevent multiple intervals

    intervalRef.current = setInterval(() => {
      // Use the ref value instead of the state
      if (!pausedRef.current) {
        timeRef.current += 1;
        setTimeSpent(timeRef.current);
      }
    }, 1000);
  };

  // Stop the timer
  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // Pause timer without resetting
  const pauseTimer = () => {
    pausedRef.current = true; // Update ref first
    setIsPaused(true);
  };

  // Resume timer
  const resumeTimer = () => {
    pausedRef.current = false; // Update ref first
    setIsPaused(false);
  };

  useEffect(() => {
    // Start timer when component mounts
    startTimer();

    // Clean up timer on unmount
    return () => {
      stopTimer();
    };
  }, []);

  // Memoize the context value to prevent unnecessary rerenders
  const contextValue = React.useMemo(
    () => ({
      timeSpent,
      formatTimeSpent,
      pauseTimer,
      resumeTimer,
    }),
    [timeSpent, isPaused]
  );

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};

// Custom hook to use the timer context
export const useQuizTimer = () => useContext(TimerContext);

// Timer display component - fully memoized
export const TimerDisplay = React.memo(() => {
  const { timeSpent, formatTimeSpent } = useQuizTimer();

  return (
    <View style={tw`flex-row items-center bg-gray-100 px-2 py-1 rounded-lg`}>
      <Ionicons name="time-outline" size={16} color="#555" style={tw`mr-1`} />
      <Text style={tw`text-sm font-medium text-gray-700`}>
        {formatTimeSpent(timeSpent)}
      </Text>
    </View>
  );
});
