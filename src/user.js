import GUN from 'gun';
import 'gun/sea';
import 'gun/axe';
import { writable } from 'svelte/store';

// Database
export const db = GUN();

// Gun User
export const user = db.user().recall({sessionStorage: true});
window.user = user

// Current User's username
export const username = writable('');
export const nick = writable('');
export const roomId = writable(null)

user.get('alias').on(v => username.set(v))
user.get('nick').on(v => nick.set(v))

db.on('auth', async(event) => {
    const alias = await user.get('alias'); // username string
    username.set(alias);

    console.log(`signed in as ${alias}`);
});
