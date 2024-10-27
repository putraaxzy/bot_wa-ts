import * as schedule from 'node-schedule';
import { EventEmitter } from 'events';
import { LessonSchedule, ScheduleConfig, Lesson } from '../types';
import { DAYS_OF_WEEK } from '../constants';
import { WhatsAppClient } from './WhatsAppClient';
import { QuoteService } from './QuoteService';
import { MessageFormatter } from './MessageFormatter';

export class ScheduleManager extends EventEmitter {
    private whatsAppClient: WhatsAppClient;
    private quoteService: QuoteService;
    private messageFormatter: MessageFormatter;
    private lessons: LessonSchedule;
    private chatId: string;

    constructor(config: ScheduleConfig, lessons: LessonSchedule) {
        super();
        this.chatId = config.chatId;
        this.lessons = lessons;
        this.whatsAppClient = new WhatsAppClient();
        this.quoteService = new QuoteService(config.geminiApiKey);
        this.messageFormatter = new MessageFormatter();

        this.initialize();
    }

    private initialize(): void {
        this.whatsAppClient.on('ready', () => {
            this.emit('ready');
            this.scheduleAllLessons();
        });

        // Forward relevant events
        ['qr', 'authenticated', 'auth_failure', 'message_error'].forEach(event => {
            this.whatsAppClient.on(event, (...args) => this.emit(event, ...args));
        });

        this.whatsAppClient.initialize();
    }

    private scheduleAllLessons(): void {
        DAYS_OF_WEEK.forEach(day => {
            if (this.lessons[day]) {
                this.lessons[day].forEach(lesson => {
                    this.scheduleLesson(day, lesson);
                });
            }
        });
        console.log('Semua jadwal telah diatur');
    }

    private scheduleLesson(day: string, lesson: Lesson): void {
        const dayIndex = DAYS_OF_WEEK.indexOf(day);
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const isFirstLesson = startHour === 7 && startMinute === 0;

        if (isFirstLesson) {
            this.scheduleMorningMessage(dayIndex, day, lesson);
        }

        this.scheduleReminderMessage(dayIndex, lesson);
        this.scheduleEndMessage(dayIndex, lesson);
    }

    private scheduleMorningMessage(dayIndex: number, day: string, lesson: Lesson): void {
        const morningCron = `0 0 5 * * ${dayIndex}`;
        schedule.scheduleJob(`morning_${lesson.subject}_${day}`, morningCron, async () => {
            const quote = await this.quoteService.getMotivationalQuote();
            const message = await this.messageFormatter.createMorningMessage(lesson, day, quote);
            this.whatsAppClient.sendMessage(this.chatId, message);
        });
    }

    private scheduleReminderMessage(dayIndex: number, lesson: Lesson): void {
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const reminderMinute = startMinute - 10 >= 0 ? startMinute - 10 : (60 + (startMinute - 10));
        const reminderHour = startMinute - 10 >= 0 ? startHour : (startHour - 1 + 24) % 24;
        const reminderCron = `0 ${reminderMinute} ${reminderHour} * * ${dayIndex}`;

        schedule.scheduleJob(`reminder_${lesson.subject}`, reminderCron, async () => {
            const quote = await this.quoteService.getMotivationalQuote();
            const message = await this.messageFormatter.createReminderMessage(lesson, quote);
            this.whatsAppClient.sendMessage(this.chatId, message);
        });
    }

    private scheduleEndMessage(dayIndex: number, lesson: Lesson): void {
        const [endHour, endMinute] = lesson.endTime.split(':').map(Number);
        const endCron = `0 ${endMinute} ${endHour} * * ${dayIndex}`;

        schedule.scheduleJob(`end_${lesson.subject}`, endCron, async () => {
            const message = this.messageFormatter.createEndMessage(lesson);
            this.whatsAppClient.sendMessage(this.chatId, message);
        });
    }

    public stop(): void {
        this.whatsAppClient.destroy();
    }
}
