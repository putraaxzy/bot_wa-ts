export interface Lesson {
    subject: string;
    startTime: string;
    endTime: string;
    teacher?: string;
    room?: string;
}

export interface LessonSchedule {
    [key: string]: Lesson[];
}

export interface ScheduleConfig {
    chatId: string;
    geminiApiKey: string;
}
