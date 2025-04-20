import { User } from '../../auth/models/user.model';

export interface Conversation {
  id?: number;
  users?: User[];
  lastUpdated?: Date;
}
