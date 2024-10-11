import { Inject, Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_ADMIN') private readonly firebaseApp: admin.app.App,
  ) {}
  async checkFirebaseToken(request: Request) {
    const token = request.headers['authorization'];
    if (token != null && token != '') {
      const decodedToken = await admin
        .auth()
        .verifyIdToken(token.replace('Bearer ', ''));
      if (decodedToken) {
        const user = {
          email: decodedToken.email,
          uid: decodedToken.uid,
          provider: decodedToken.firebase.sign_in_provider,
        };
        return user;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  async sendMessage({
    token,
    title,
    body,
    refrence,
    type,
    // user,
  }: {
    token?: string;
    title: string;
    body: string;
    refrence: string;
    type: string;
    user?: string;
  }): Promise<void> {
    if (!token) {
      return;
    }
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: {
        refrence,
        type,
      },
    };
    try {
      await this.firebaseApp.messaging().send(message);
    } catch (e) {}
  }
}
