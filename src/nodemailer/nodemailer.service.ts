import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { reset_password_html } from './html/reset-password';

@Injectable()
export class MailerService {
  from = 'company';
  constructor(
    @Inject('TRANSPORTER') private transporter: nodemailer.Transporter,
  ) {}
  sendChangingPasswordCode(body: { mail: string; name: string; code: string }) {
    const to = body.mail;
    const html = reset_password_html(body.code, body.name);
    return this.sendMail({ from: this.from, to, html });
  }
  private sendMail(opts: { from: string; to: string; html: string }) {
    return this.transporter.sendMail(opts);
  }
  resetCode() {
    return String(Math.floor(1000 + Math.random() * 8000));
  }
}
