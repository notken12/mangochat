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

export async function getNick(id) {
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

let usernameVal;
username.subscribe((v) => (usernameVal = v));

user.get("alias").on((v) => username.set(v));
user.get("nick").on((v) => nick.set(v));

db.on("auth", async (event) => {
  const alias = await user.get("alias"); // username string
  username.set(alias);
  const apair = await user.get("pair");
  let pairdata = { pub: apair.pub, epub: apair.epub };
  if (!apair) {
    let apair = await SEA.pair();
    console.log("pair data", pairdata);
    // Save their pair to their user's "pair" property in the db
    pair.set(apair)
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
    console.log("pair data", pairdata);
    console.log(usernameVal);
    pair.set(apair)
    db.get("pubkeys")
      .get(usernameVal)
      .put(pairdata, (r) => {
        console.log(r);
        pair.set(apair);
        console.log("has saved pair", apair);
      });
  }

  console.log(`signed in as ${alias}`);
});
