import { Lesson } from '../types';

export class MessageFormatter {
    private formatTime(time: string): string {
        return time.padStart(5, '0');
    }

    public async createMorningMessage(lesson: Lesson, day: string, quote: string): Promise<string> {
        const teacherStr = lesson.teacher ? ` dengan ${lesson.teacher}` : '';
        return `🌅 *Selamat Pagi XI RPL!*\n\n` +
               `Hari ini ${day} pelajaran pertama:\n` +
               `📚 ${lesson.subject}${teacherStr}\n` +
               `⏰ Jadwal: ${this.formatTime(lesson.startTime)} - ${this.formatTime(lesson.endTime)}\n\n` +
               `Quote hari ini:\n_${quote}_\n\n` +
               `Semangat belajar! 💪`;
    }

    public async createReminderMessage(lesson: Lesson, quote: string): Promise<string> {
        const teacherStr = lesson.teacher ? ` dengan ${lesson.teacher}` : '';
        return `⏰ *Pengingat Pergantian Pelajaran*\n\n` +
               `Dalam 10 menit akan dimulai:\n` +
               `📚 ${lesson.subject}${teacherStr}\n` +
               `⏰ Waktu: ${this.formatTime(lesson.startTime)} - ${this.formatTime(lesson.endTime)}\n\n` +
               `Quote motivasi:\n_${quote}_`;
    }

    public createEndMessage(lesson: Lesson): string {
        return `🔔 Pelajaran ${lesson.subject} telah selesai.\n` +
               `Terima kasih atas perhatiannya! 🙏`;
    }
}
