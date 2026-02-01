/**
 * Calendar Integration Utilities
 * Generates .ics files for calendar export and provides platform-specific calendar URLs
 */

export interface CalendarEvent {
    title: string;
    description?: string;
    location?: string;
    startDate: Date;
    endDate: Date;
    allDay?: boolean;
}

/**
 * Format date for iCalendar (YYYYMMDD or YYYYMMDDTHHmmssZ)
 */
function formatICSDate(date: Date, allDay: boolean = false): string {
    if (allDay) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    }

    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escape special characters for iCalendar format
 */
function escapeICS(text: string): string {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,')
        .replace(/\n/g, '\\n');
}

/**
 * Generate a unique ID for the calendar event
 */
function generateUID(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@baulot.de`;
}

/**
 * Generate iCalendar (.ics) file content
 */
export function generateICS(event: CalendarEvent): string {
    const now = formatICSDate(new Date());
    const uid = generateUID();

    const dateFormat = event.allDay ? 'DATE' : 'DATE-TIME';
    const startDate = formatICSDate(event.startDate, event.allDay);
    const endDate = formatICSDate(event.endDate, event.allDay);

    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BauLot//Bauprojekt Timeline//DE',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${now}`,
        `DTSTART;VALUE=${dateFormat}:${startDate}`,
        `DTEND;VALUE=${dateFormat}:${endDate}`,
        `SUMMARY:${escapeICS(event.title)}`,
    ];

    if (event.description) {
        lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }

    if (event.location) {
        lines.push(`LOCATION:${escapeICS(event.location)}`);
    }

    lines.push('END:VEVENT', 'END:VCALENDAR');

    return lines.join('\r\n');
}

/**
 * Download .ics file
 */
export function downloadICS(event: CalendarEvent, filename?: string): void {
    const icsContent = generateICS(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
}

/**
 * Generate Google Calendar URL
 */
export function getGoogleCalendarUrl(event: CalendarEvent): string {
    const formatGoogleDate = (date: Date): string => {
        if (event.allDay) {
            return date.toISOString().slice(0, 10).replace(/-/g, '');
        }
        return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: event.title,
        dates: `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`,
    });

    if (event.description) {
        params.set('details', event.description);
    }

    if (event.location) {
        params.set('location', event.location);
    }

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate Apple Calendar URL (webcal protocol)
 * Note: This requires hosting the .ics file
 */
export function getAppleCalendarUrl(icsUrl: string): string {
    return icsUrl.replace(/^https?:/, 'webcal:');
}

/**
 * Detect if user is on iOS
 */
export function isIOS(): boolean {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Detect if user is on Android
 */
export function isAndroid(): boolean {
    if (typeof window === 'undefined') return false;
    return /Android/.test(navigator.userAgent);
}

/**
 * Add event to calendar with platform-appropriate method
 */
export function addToCalendar(event: CalendarEvent): void {
    if (isAndroid()) {
        // On Android, open Google Calendar directly
        window.open(getGoogleCalendarUrl(event), '_blank');
    } else {
        // On iOS and other platforms, download .ics file
        downloadICS(event);
    }
}

/**
 * Create a project calendar event
 */
export function createProjectEvent(
    projectName: string,
    address: string,
    startDate: Date,
    endDate: Date
): CalendarEvent {
    return {
        title: `🏗 ${projectName}`,
        description: `Bauprojekt: ${projectName}\nAdresse: ${address}`,
        location: address,
        startDate,
        endDate,
        allDay: true,
    };
}

/**
 * Create a trade/gewerk calendar event
 */
export function createTradeEvent(
    tradeName: string,
    projectName: string,
    startDate: Date,
    endDate: Date,
    company?: string
): CalendarEvent {
    return {
        title: `🔧 ${tradeName}`,
        description: `Gewerk: ${tradeName}\nProjekt: ${projectName}${company ? `\nFirma: ${company}` : ''}`,
        startDate,
        endDate,
        allDay: true,
    };
}

/**
 * Create a task calendar event
 */
export function createTaskEvent(
    taskName: string,
    tradeName: string,
    projectName: string,
    dueDate: Date
): CalendarEvent {
    return {
        title: `✅ ${taskName}`,
        description: `Aufgabe: ${taskName}\nGewerk: ${tradeName}\nProjekt: ${projectName}`,
        startDate: dueDate,
        endDate: dueDate,
        allDay: true,
    };
}
