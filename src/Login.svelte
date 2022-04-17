<!--
  Login.svelte

  MIT License

  Copyright (c) 2022 Ken Zhou, Ray Shen, Eli Osei-Tutu, Viraj

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
-->
<script>
  import { user, nick, username } from "./user";
  import { deso } from "./deso";
  import GUN from "gun";
  const db = GUN();

  let wallet;
  let pwd;
  let settingNick = false;
  let nickToSet = "";

  let usernameVal;
  username.subscribe((v) => (usernameVal = v));

  let nickVal;
  nick.subscribe((n) => {
    nickVal = n;
  });

  if (!nickVal && usernameVal) {
    settingNick = true;
  }

  function login(cb) {
    user.auth(wallet, pwd, ({ err }) => {
      if (!err) {
        cb();
      }
    });
  }

  async function promptLogin() {
    const response = await deso.identity.login(4);
    console.log(response);
    let { key } = response;
    // Set users username to their Deso pubkey
    wallet = key;
    let { encryptedSeedHex } = response.user;
    pwd = encryptedSeedHex;
    console.log(wallet);
    user.auth(wallet, pwd, ({ err }) => {
      if (err) {
        console.log(err);
        user.create(wallet, pwd, ({ err }) => {
          if (err) {
            alert(err);
          } else {
            login(() => {
              if (nickVal === undefined) {
                settingNick = true;
              }
            });
          }
        });
      } else {
        if (nickVal === undefined) {
          settingNick = true;
        }
      }
    });
  }

  function setNick() {
    // db.user(name).set("nick", , (result) => {
    //   let {err} = result

    //   console.log(result)
    //   if (!err) {
    //     // TODO: show UI let the user click on a chat room
    //   }
    // })

    // var auser = db.user(wallet).put({nick: nick});
    // db.get('users').set(auser, (result) => {
    //   console.log(result)
    // });
    user.get("nick").put(nickToSet, console.log);
    db.get("nicks").get(usernameVal).put(nickToSet);
    nick.set(nickToSet);
  }
</script>

<!-- <h1>Hello {$nick || $username}</h1> -->

{#if settingNick}
  <label style="font-size: 40px;" class="" for="username">Nickname</label>
  <div style="position:relative; top:40px;">
    <input
      size="24"
      name="username"
      bind:value={nickToSet}
      minlength="3"
      maxlength="16"
    />
  </div>

  <div style="position:relative; left:0px; top:100px;">
    <button class="login" on:click={setNick}>Set nickname</button>
  </div>
{:else}
  <div>
    <img src="logo.png" alt="logo" width="600" height="600" class="logo" />
  </div>

  <div style="position:relative; left:0px; top:-70px;">
    <button class="login" on:click={promptLogin}>Login</button>
  </div>
{/if}
