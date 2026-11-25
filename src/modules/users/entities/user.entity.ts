import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    Unique,
} from 'typeorm';

export const USERS_EMAIL_UNIQUE = 'uq_users_email';

@Entity('users')
@Unique(USERS_EMAIL_UNIQUE, ['email'])
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 254 })
    email!: string;

    @Column({ name: 'password_hash', type: 'text', select: false })
    passwordHash!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
