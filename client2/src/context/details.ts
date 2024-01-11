import { createContext } from 'react';
import {generateUsername} from 'unique-username-generator'

export const username = generateUsername();
export const UserContext = createContext({username});