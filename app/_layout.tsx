
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: '#071C15',
          },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="record" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}
