import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { FirebaseService } from './firebase.service';

@Module({
  controllers: [],
  providers: [
    {
      provide: 'FIREBASE_ADMIN',
      useFactory: function (config: ConfigService) {
        return admin.initializeApp({
          credential: admin.credential.cert({
            type: config.get('FIREBASE_TYPE'),
            project_id: config.get('FIREBASE_PROJECT_ID'),
            private_key_id: config.get('FIREBASE_PRIVATE_KEY_ID'),
            private_key: config
              .get('FIREBASE_PRIVATE_KEY')
              .replace(/\\n/g, '\n'), // Replace escaped newlines
            client_email: config.get('FIREBASE_CLIENT_EMAIL'),
            client_id: config.get('FIREBASE_CLIENT_ID'),
            auth_uri: config.get('FIREBASE_AUTH_URI'),
            token_uri: config.get('FIREBASE_TOKEN_URI'),
            auth_provider_x509_cert_url: config.get(
              'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
            ),
            client_x509_cert_url: config.get('FIREBASE_CLIENT_X509_CERT_URL'),
            universe_domain: config.get('FIREBASE_UNIVERSE_DOMAIN'),
          } as admin.ServiceAccount),
          // databaseURL: config.get('Firebase_Url'),
        });
      },
      inject: [ConfigService],
    },
    FirebaseService,
  ],
  imports: [],
  exports: [FirebaseService],
})
export class FirebaseModule {}
