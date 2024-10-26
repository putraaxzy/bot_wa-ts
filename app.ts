import { Client, Message } from 'whatsapp-web.js';
import * as schedule from 'node-schedule';
import { EventEmitter } from 'events';
import QRCode from 'qrcode-terminal';
import axios from 'axios';

interface Lesson {
    subject: string;
    startTime: string;
    endTime: string;
    teacher?: string;
    room?: string;
}

interface LessonSchedule {
    [key: string]: Lesson[];
}

export class ScheduleManager extends EventEmitter {
    private client: Client;
    private lessons: LessonSchedule;
    private chatId: string;
    private readonly daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    private readonly geminiApiKey = '123'; // token gemini mu

    constructor(chatId: string, lessons: LessonSchedule) {
        super();
        this.chatId = chatId;
        this.lessons = lessons;
        this.client = new Client({
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.initialize();
    }

    private async getMotivationalQuote(): Promise<string> {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: "Berikan satu quote motivasi atau filosofi Jawa (dengan terjemahan Bahasa Indonesia) tentang semangat belajar, kesuksesan, atau kehidupan. Format: Quote Jawa - Terjemahan Indonesia"
                        }]
                    }]
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error getting quote:', error);
            return "Aja rumangsa bisa, nanging bisaa rumangsa - Jangan merasa bisa, tetapi bisalah merasa";
        }
    }

    public initialize(): void {
        this.client.on('qr', (qr: string) => {
            console.log('QR Code siap untuk di scan:');
            QRCode.generate(qr, { small: true });
            this.emit('qr', qr);
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client siap!');
            this.emit('ready');
            this.scheduleAllLessons();
        });

        this.client.on('authenticated', () => {
            console.log('Autentikasi berhasil!');
            this.emit('authenticated');
        });

        this.client.on('auth_failure', (error: Error) => {
            console.error('Autentikasi gagal:', error);
            this.emit('auth_failure', error);
        });

        this.client.initialize().catch((error: Error) => {
            console.error('Gagal menginisialisasi client:', error);
            this.emit('init_error', error);
        });
    }

    private async sendMessage(message: string): Promise<void> {
        try {
            await this.client.sendMessage(this.chatId, message);
            console.log('Pesan terkirim:', message);
        } catch (error) {
            console.error('Gagal mengirim pesan:', error);
            this.emit('message_error', error);
        }
    }

    private formatTime(time: string): string {
        return time.padStart(5, '0');
    }

    private scheduleAllLessons(): void {
        this.daysOfWeek.forEach(day => {
            if (this.lessons[day]) {
                this.lessons[day].forEach(lesson => {
                    this.scheduleLesson(day, lesson);
                });
            }
        });
        console.log('Semua jadwal telah diatur');
    }

    private scheduleLesson(day: string, lesson: Lesson): void {
        const dayIndex = this.daysOfWeek.indexOf(day);
        const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
        const isFirstLesson = startHour === 7 && startMinute === 0;

        if (isFirstLesson) {
            const morningCron = `0 0 5 * * ${dayIndex}`;
            schedule.scheduleJob(`morning_${lesson.subject}_${day}`, morningCron, async () => {
                const quote = await this.getMotivationalQuote();
                const message = await this.createMorningMessage(lesson, day, quote);
                this.sendMessage(message);
            });
        }

        const reminderMinute = startMinute - 10 >= 0 ? startMinute - 10 : (60 + (startMinute - 10));
        const reminderHour = startMinute - 10 >= 0 ? startHour : (startHour - 1 + 24) % 24;
        const reminderCron = `0 ${reminderMinute} ${reminderHour} * * ${dayIndex}`;

        schedule.scheduleJob(`reminder_${lesson.subject}_${day}`, reminderCron, async () => {
            const quote = await this.getMotivationalQuote();
            const message = await this.createReminderMessage(lesson, quote);
            this.sendMessage(message);
        });

        const [endHour, endMinute] = lesson.endTime.split(':').map(Number);
        const endCron = `0 ${endMinute} ${endHour} * * ${dayIndex}`;

        schedule.scheduleJob(`end_${lesson.subject}_${day}`, endCron, async () => {
            const message = this.createEndMessage(lesson);
            this.sendMessage(message);
        });
    }

    private async createMorningMessage(lesson: Lesson, day: string, quote: string): Promise<string> {
        const teacherStr = lesson.teacher ? ` dengan ${lesson.teacher}` : '';
        return `🌅 *Selamat Pagi XI RPL!*\n\n` +
               `Hari ini ${day} pelajaran pertama:\n` +
               `📚 ${lesson.subject}${teacherStr}\n` +
               `⏰ Jadwal: ${this.formatTime(lesson.startTime)} - ${this.formatTime(lesson.endTime)}\n\n` +
               `Quote hari ini:\n_${quote}_\n\n` +
               `Semangat belajar! 💪`;
    }

    private async createReminderMessage(lesson: Lesson, quote: string): Promise<string> {
        const teacherStr = lesson.teacher ? ` dengan ${lesson.teacher}` : '';
        return `⏰ *Pengingat Pergantian Pelajaran*\n\n` +
               `Dalam 10 menit akan dimulai:\n` +
               `📚 ${lesson.subject}${teacherStr}\n` +
               `⏰ Waktu: ${this.formatTime(lesson.startTime)} - ${this.formatTime(lesson.endTime)}\n\n` +
               `Quote motivasi:\n_${quote}_`;
    }

    private createEndMessage(lesson: Lesson): string {
        return `🔔 Pelajaran ${lesson.subject} telah selesai.\n` +
               `Terima kasih atas perhatiannya! 🙏`;
    }

    public stop(): void {
        this.client.destroy();
    }
}

// Jadwal pelajaran
const lessons: LessonSchedule = {
    Monday: [
        {
            subject: 'RPL',
            startTime: '07:00',
            endTime: '09:40',
            teacher: 'Pak Mift'
        },
        {
            subject: 'RPL',
            startTime: '09:55',
            endTime: '11:55',
            teacher: 'Pak Aji'
        },
        {
            subject: 'Bahasa Indonesia',
            startTime: '12:25',
            endTime: '13:45',
            teacher: 'Bu Sendy'
        }
    ],
    Tuesday: [
        {
            subject: 'PKN',
            startTime: '07:00',
            endTime: '08:20',
            teacher: 'Bu Idha'
        },
        {
            subject: 'Seni Budaya',
            startTime: '08:20',
            endTime: '09:40'
        },
        {
            subject: 'RPL',
            startTime: '09:55',
            endTime: '11:55',
            teacher: 'Pak Mift'
        },
        {
            subject: 'Ekstra Agama',
            startTime: '12:25',
            endTime: '13:45'
        }
    ],
    Wednesday: [
        {
            subject: 'RPL',
            startTime: '07:00',
            endTime: '08:20',
            teacher: 'Pak Aji Romdhon'
        },
        {
            subject: 'Sejarah',
            startTime: '08:20',
            endTime: '09:40',
            teacher: 'Pak Kelik'
        },
        {
            subject: 'RPL',
            startTime: '09:55',
            endTime: '11:55',
            teacher: 'Pak Aji Amadani'
        },
        {
            subject: 'RPL',
            startTime: '12:25',
            endTime: '13:45',
            teacher: 'Pak Aji Romdhon'
        }
    ],
    Thursday: [
        {
            subject: 'Kewirausahaan',
            startTime: '07:00',
            endTime: '09:00',
            teacher: 'Bu Endang'
        },
        {
            subject: 'PAI',
            startTime: '09:00',
            endTime: '11:15',
            teacher: 'Pak Fatur'
        },
        {
            subject: 'Matematika',
            startTime: '11:15',
            endTime: '13:45',
            teacher: 'Bu Rahmi'
        }
    ],
    Friday: [
        {
            subject: 'Bahasa Jawa',
            startTime: '07:00',
            endTime: '08:20',
            teacher: 'Bu Hernaningrum'
        },
        {
            subject: 'Bahasa Inggris',
            startTime: '08:20',
            endTime: '09:40',
            teacher: 'Pak Agus'
        },
        {
            subject: 'Seni Budaya',
            startTime: '09:55',
            endTime: '11:15'
        }
    ],
    Saturday: [
        {
            subject: 'RPL',
            startTime: '07:00',
            endTime: '08:20',
            teacher: 'Pak Aji Romdhon'
        },
        {
            subject: 'PJOK',
            startTime: '08:20',
            endTime: '09:40',
            teacher: 'Pak Trijanto'
        },
        {
            subject: 'Bahasa Indonesia',
            startTime: '09:55',
            endTime: '10:35',
            teacher: 'Bu Sendy'
        },
        {
            subject: 'Bahasa Inggris',
            startTime: '10:35',
            endTime: '11:55'
        },
        {
            subject: 'Matematika',
            startTime: '12:25',
            endTime: '13:45',
            teacher: 'Bu Leni'
        }
    ],
    Sunday: []
};

// Penggunaan
const chatId = '120363335096925459@g.us';
const scheduleManager = new ScheduleManager(chatId, lessons);

// Event handlers
scheduleManager.on('qr', (qr: string) => {
    console.log('Scan QR code ini:', qr);
});

scheduleManager.on('ready', () => {
    console.log('Sistem notifikasi jadwal siap!');
});

scheduleManager.on('message_error', (error: Error) => {
    console.error('Terjadi kesalahan saat mengirim pesan:', error);
});

process.on('SIGINT', () => {
    console.log('Menghentikan aplikasi...');
    scheduleManager.stop();
    process.exit(0);
});