import { Client } from 'whatsapp-web.js';
import { EventEmitter } from 'events';
import QRCode from 'qrcode-terminal';

export class WhatsAppClient extends EventEmitter {
    private client: Client;

    constructor() {
        super();
        this.client = new Client({
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.client.on('qr', (qr: string) => {
            console.log('QR Code siap untuk di scan:');
            QRCode.generate(qr, { small: true });
            this.emit('qr', qr);
        });

        this.client.on('ready', () => {
            console.log('WhatsApp client siap!');
            this.emit('ready');
        });

        this.client.on('authenticated', () => {
            console.log('Autentikasi berhasil!');
            this.emit('authenticated');
        });

        this.client.on('auth_failure', (error: Error) => {
            console.error('Autentikasi gagal:', error);
            this.emit('auth_failure', error);
        });
    }

    public async initialize(): Promise<void> {
        try {
            await this.client.initialize();
        } catch (error) {
            console.error('Gagal menginisialisasi client:', error);
            this.emit('init_error', error);
        }
    }

    public async sendMessage(chatId: string, message: string): Promise<void> {
        try {
            await this.client.sendMessage(chatId, message);
            console.log('Pesan terkirim:', message);
        } catch (error) {
            console.error('Gagal mengirim pesan:', error);
            this.emit('message_error', error);
        }
    }

    public destroy(): void {
        this.client.destroy();
    }
}
