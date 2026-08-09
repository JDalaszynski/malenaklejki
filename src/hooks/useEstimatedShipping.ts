import { useState, useEffect } from "react";

function addBusinessDays(startDate: Date, businessDays: number): Date {
  const date = new Date(startDate);
  let daysAdded = 0;
  while (daysAdded < businessDays) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 0 && day !== 6) {
      daysAdded++;
    }
  }
  return date;
}

function formatDate(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
}

export function getEstimatedShippingText(): string {
  // Get current time in Warsaw
  const now = new Date();
  const warsawTimeString = now.toLocaleString("en-US", { timeZone: "Europe/Warsaw" });
  const warsawNow = new Date(warsawTimeString);
  
  const hour = warsawNow.getHours();
  const isWeekend = warsawNow.getDay() === 0 || warsawNow.getDay() === 6;
  
  // Jeśli przed 12:00 (i dzień roboczy), wysyłka to 0-1 dni roboczych.
  // Jeśli po 12:00 (lub weekend), wysyłka to 1-2 dni roboczych.
  const maxDaysToAdd = (hour < 12 && !isWeekend) ? 1 : 2;
  const minDaysToAdd = maxDaysToAdd - 1;
  
  const minDate = addBusinessDays(warsawNow, minDaysToAdd);
  const maxDate = addBusinessDays(warsawNow, maxDaysToAdd);
  
  return `Szacowana wysyłka: ${formatDate(minDate)}-${formatDate(maxDate)}`;
}

export function useEstimatedShipping() {
  const [text, setText] = useState<string>("Obliczanie...");

  useEffect(() => {
    setText(getEstimatedShippingText());
  }, []);

  return text;
}
