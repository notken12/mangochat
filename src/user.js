import GUN from "gun";
import "gun/sea";
import "gun/axe";
import { writable } from "svelte/store";

// Database
export const db = GUN();

// Gun User
export const user = db.user().recall({ sessionStorage: true });
window.user = user;

// Current User's username
export const username = writable("");
export const nick = writable(undefined);
export const roomId = writable(null);
export const pair = writable(null);
export const nicks = writable({});
export const currentRoom = writable(undefined);
let nicksVal;
nicks.subscribe((v) => (nicksVal = v));
window.nicks = nicksVal;
export function getRoomName(room) {
  if (room.members) {
    let s = "";
    for (let i = 0; i < room.members.length; i++) {
      let mem = room.members[i];
      // Don't list yourself
      if (mem == usernameVal) continue;
      if (i !== 0 && s !== "") {
        s += ", ";
      }
      let memNick = nicksVal[mem];
      s += memNick || mem;
      if (memNick === undefined) {
        // console.log("getting nick");
        getNick(mem);
      }
    }
    return s;
  }
}

export async function getNick(id) {
  if (nicksVal[id] !== undefined) return;
  if (!id) return;
  db.get("nicks")
    .get(id)
    .once(async (data, id) => {
      nicks.update((n) => {
        if (data === undefined) {
          n[id] = null;
        } else {
          n[id] = data;
        }
        return n;
      });
    });
}

export function generateUUID() {
  // Public Domain/MIT
  var d = new Date().getTime(); //Timestamp
  var d2 =
    (typeof performance !== "undefined" &&
      performance.now &&
      performance.now() * 1000) ||
    0; //Time in microseconds since page-load or 0 if unsupported
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = Math.random() * 16; //random number between 0 and 16
    if (d > 0) {
      //Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      //Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

let usernameVal;
username.subscribe((v) => (usernameVal = v));

user.get("alias").on((v) => username.set(v));
user.get("nick").on((v) => nick.set(v));
db.get("nicks")
  .get(usernameVal)
  .on((v) => nick.set(v));

db.on("auth", async (event) => {
  user.get("alias").once((v) => {
    username.set(v);
  }); // username string
  user.get("pair").once(async (apair) => {
    if (!apair) {
      let apair = await SEA.pair();
      // Save their pair to their user's "pair" property in the db
      pair.set(apair);
      let pairdata = { pub: apair.pub, epub: apair.epub };
      // console.log("pair data", pairdata);
      user.get("pair").put(apair, (res) => {
        console.log(res);

        db.get("pubkeys")
          .get(usernameVal)
          .put(pairdata, (r) => {
            console.log(r);
            console.log("pair", apair);
            pair.set(apair);
          });
      });
    } else {
      let pairdata = { pub: apair.pub, epub: apair.epub };
      // console.log("pair data", pairdata);
      // console.log(usernameVal);
      pair.set(apair);
      db.get("pubkeys")
        .get(usernameVal)
        .put(pairdata, (r) => {
          console.log(r);
          pair.set(apair);
          console.log("has saved pair", apair);
        });
    }
  });

  user.get("nick").on((v) => nick.set(v));
  db.get("nicks")
    .get(usernameVal)
    .on((v) => nick.set(v));
});

const desoMsgHeader = "--- DESO TRANSFER ---\n";

export function getSendDesoMsg(recipient, amountDeso, amountUsd) {
  return desoMsgHeader + JSON.stringify({ recipient, amountDeso, amountUsd });
}

export function parseSendDesoMsg(msg) {
  if (!msg.startsWith(desoMsgHeader)) return false;
  let json = msg.substring(desoMsgHeader.length, msg.length);
  return JSON.parse(json);
}
