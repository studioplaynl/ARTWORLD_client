<script>
  // eslint-disable-next-line no-unused-vars
  import { createEventDispatcher, onMount } from 'svelte';
  import { dlog } from '../../helpers/debugLog';
  import SendArtMail from './sendArtMail.svelte';
  import { returnSameTypeApps, returnAppIconUrl, PERMISSION_READ_PUBLIC } from '../../constants';
  import { getRandomName,
    uploadImage,
    getDateAndTimeFormatted,
    getFile,
    getObject,
  } from '../../helpers/nakamaHelpers';

  export let row = null;
  // eslint-disable-next-line svelte/valid-compile
  export let col = null;
  // eslint-disable-next-line svelte/valid-compile
  export let isCurrentUser = null;
  export let rowIndex = -1;

  // eslint-disable-next-line svelte/valid-compile
  export let store = null;

  let sendToApps = null;
  let selectedSendTo = null;
  let sendFromAppIconUrl = null;
  let hasSent = false;

  // dispatch an event to hide/ show other elements of the SvelteTable
  const dispatch = createEventDispatcher();

  let toggleMode = true;
  let displayName = '';

  async function toggle() {
    /* get sendToApps when we open the SendTo component
    * as an array of app names */
    if (toggleMode) {
      /* get the icons of the apps the user can send art to
      * it checks the type of art it is currently in
      * then it gets the apps icons of similar art types
      * the icons can be round, square, square with a border */
      sendToApps = returnSameTypeApps(row.collection);
    }

    toggleMode = !toggleMode;
    /* open/ close the panel depending on state in the parent component */
    dispatch('toggleComponents', { rowIndex, toggleMode });
  }

  function close() {
    selectedSendTo = '';
    toggleMode = !toggleMode;
    /* close the panel in the parent component */
    dispatch('toggleComponents', { rowIndex, toggleMode });
  }

  const optionIdentifier = 'id';
  const labelIdentifier = 'username';

  const items = [];

  let value;

  onMount(() => {
    // console.log('row: ', row);
    /* we want to show the app icon from where we send */
    sendFromAppIconUrl = returnAppIconUrl(row.collection, 'square');
    if (rowIndex) {
      /* send a message back to the parent to close the other
      * options in the row */
      dispatch('toggleComponents', { rowIndex, toggleMode });
    }
  });

    /** Load file information from server and return object with */
    /* TODO using the same function as in apploader/ drawing, consolidate this function */
  async function getFileInformation(collectionName, userId, key) {
    if (userId && key) {
      try {
        const loadingObject = await getObject(collectionName, key, userId);

        // TODO: Het kan zijn dat een object leeg terugkomt. Dan staan wellicht de permissies fout.

        if (loadingObject) {
          // dlog('loadingObject', loadingObject);
          const file = await getFile(loadingObject.value.url);
          // dlog('loadingObject', loadingObject);
          // set the displayName, so it can also be changed in the Drawing app
          displayName = loadingObject.value.displayname;
          dlog(
            'loadingObject.permission_read: ',
            loadingObject.permission_read,
          );
          return {
            key,
            userId,
            loaded: true,
            new: false,
            displayName: loadingObject.value.displayname,
            type: loadingObject.collection,
            // status: loadingObject.permission_read === PERMISSION_READ_PUBLIC,
            status: loadingObject.permission_read,
            url: file,
            awsUrl: loadingObject.value.url,
            frames: 1,
          };
        }
      } catch (error) {
        dlog('error', error);
        return {
          key,
          userId,
          loaded: false,
          new: false,
        };
      }
    }

    return {
      loaded: false,
      new: false,
    };
  }

  async function send() {
    // const data = {
    //   user_id: row.user_id,
    //   key: row.key,
    //   username: row.username,
    //   previewUrl: row.value.previewUrl,
    //   url: row.value.url,
    // };
    // dlog('data: ', data);

    // Step 1: Download the artwork info
    const currentFile = await getFileInformation(row.collection, row.user_id, row.key);

    if (!currentFile.loaded) {
      dlog('Unable to load the file.');
      return;
    }

    // // Step 2: Get the blob data from the file URL
    if (!currentFile.url) {
      dlog('Failed to get the file URL.');
      return;
    }

    const response = await fetch(currentFile.url);
    const blobData = await response.blob();
    // const response = await fetch(fileUrl);

    if (!blobData) {
      dlog('Failed to fetch the blob data.');
      return;
    }

    // Generate new attributes for the file
    displayName = await getRandomName();
    currentFile.key = `${getDateAndTimeFormatted()}_${displayName}`;
    currentFile.type = selectedSendTo;
    currentFile.status = PERMISSION_READ_PUBLIC;

    // Step 3: Upload the image
    const uploadedUrl = await uploadImage(
      currentFile.key,
      currentFile.type,
      blobData,
      currentFile.status,
      0,
      currentFile.displayName,
    );

    if (!uploadedUrl) {
      dlog('Failed to upload the image.');
      return;
    }

    /* the object associated with the uploaded file
    *  is created in the uploadImage function
    */

    hasSent = true;
    // Close the modal or panel
    // close();
  }


  function handleSendTo(sendToApp) {
    // console.log('sendToApp: ', sendToApp);
    selectedSendTo = sendToApp;
    /* if we have send and select an other app we should
    * be able to send again
    */
    hasSent = false;
  }

</script>

<div class="sendTo-flex-container">
  {#if toggleMode}
    <button on:click="{toggle}" class="sendButton">
      <img
        alt="open send art options"
        class="icon-medium"
        src="/assets/svg/icon/send_art_square.svg"
      />
    </button>
  {:else}
    <div class='sendTo-border'>
      <div class='row'>
        <button on:click="{toggle}" class="sendButton">
          <img
          alt="open send art options"
          class="icon-medium"
          src="/assets/svg/icon/send_art_square.svg"
          />
        </button>
        <button on:click="{close}" class="sendButton close-btn">
          <img
          alt="close send art options"
          class="icon-medium"
          src="/assets/SHB/svg/AW-icon-cross.svg"
          />
        </button>
      </div> <!-- div row-->


      <div class='row'>
        <!-- for each sendToApp we make a button with image -->
        {#each sendToApps as app}
        <button class="sendButton {selectedSendTo === app ? 'selected' : ''}"
          on:click={() => handleSendTo(app)} >
          <img class="icon-medium" src={returnAppIconUrl(app, 'square')} alt={app} />
        </button>
        {/each}
        <button
          on:click={() => handleSendTo('artMail')}
          class="sendButton {selectedSendTo === 'artMail' ? 'selected' : ''}">
          <img
          alt="send art to friend"
          class="icon-medium"
          src="/assets/svg/icon/send_to_person.svg"
          />
        </button>
      </div> <!-- div row-->

      {#if selectedSendTo}
      <div class="row">
        {#if selectedSendTo === 'artMail'}
        <SendArtMail row="{row}" />
        {:else}
        <div class="send-icon-row">
          <!-- -->

          <!-- show when the artwork has been send -->
          {#if hasSent}
          <img class="icon-medium" src="{sendFromAppIconUrl}" alt="From app icon" />
          <img class="icon-medium" src="/assets/SHB/svg/AW-icon-next.svg" alt="Send art square icon" />
          <img class="icon-medium" src={returnAppIconUrl(selectedSendTo, 'square')} alt={selectedSendTo} />
          {/if}

          <!--  -->

          <!-- <div class="sendButtonContainer"> -->
            {#if !hasSent}
            <button on:click="{send}" class="sendButton">
              <img src="/assets/SHB/svg/AW-icon-next.svg" alt="Send art mail to friend" class="sendIcon" />
            </button>
            {:else}

            <img src="/assets/SHB/svg/AW-icon-check.svg" alt="Mail Sent" class="checkIcon" />
            {/if}

            <!--sendButtonContainer-->
          <!-- </div>  -->

          <!-- send-icon-row -->
        </div>
        {/if}
      </div>
      {/if}
    </div> <!-- div border-->
      {/if}
</div> <!-- div sendTo-flex-container-->

<style>
  .selected {
    border-radius: 50%;
    border: 2px solid #7300ed;
    /* box-shadow: 0 5px 0 0 #7300ed; */
  }

  .send-icon-row {
    display: flex;
    align-items: center;
    justify-content: center;
    /* width: 100%; */
    margin: 0 10px 0 10px;
    /* space between items */
    /* gap: 6px;  */
    position: relative;
  }

  .send-icon-row > .icon-medium:first-child {
      width: 40px;   /* Adjust this value to your preference for the "bigger" size */
  }

  .send-icon-row > .icon-medium:nth-child(2) {
      width: 40px;   /* Adjust this value to your preference for the "smaller" size */
  }

  .send-icon-row > .icon-medium:nth-child(3) {
      width: 40px;   /* Adjust this value to your preference for the "same as the first" size */
  }

  .send-icon-row > .sendButton:first-child {
      width: 40px;   /* Adjust this value to your preference for the "bigger" size */
  }

  .sendIcon{
    background-color: white;
    border-radius: 50%;
    box-shadow: 5px 5px 0px #7300ed;
    width: 50px;
    height: 50px;
  }
  .sendButton {
      background-color: transparent;

      /* keep the image in the middle of the button */
      display: flex;
      align-items: center;
      justify-content: center;

      /* Adding shadow to the button */
      /* box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  */
      /* Smoothens the transition during hover and active states */
      /* transition: transform 0.3s, box-shadow 0.3s;  */
  }

  .sendButtonContainer {

  }

  /* Hover State */
  .sendButton:hover {
      /* Example: Change background color slightly on hover */
      /* background-color: rgba(240, 240, 240);  */

      /* Optional: "Lift" effect on hover */
      /* transform: scale(1.1); */
      /* box-shadow: 5px 5px 0px #7300ed; */
    }

  /* Active/Pressed State */
  .sendButton:active {
      /* Simulate a pressed effect by scaling down the button slightly */
      transform: scale(0.98);

      /* You can also adjust the shadow to give a "pressed" depth effect */
      /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  }

  .sendTo-flex-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-evenly;
    /* width: 100%;
    height: 100%; */
  }

  .sendTo-border{
    box-shadow: 2px 2px #7300ed;
    /* border:#7300ed 1px solid; */
    border-radius: 12px;
    margin: 0 5px 15px 0;
    background-color: rgb(255, 255, 255);
  }
  .checkIcon {
    /* position: relative;
    top: -8rem;
    right: -4rem;
    width: 2rem;
    height: 2rem;
    z-index: 999; */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    /* box-shadow: 5px 5px 0px #7300ed; */
  }
  .row {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  .close-btn {
    order: 2; /* Ensures the close button always goes to the end */
  }

  .icon-medium{
    width: 40px;
    height: 40px;
  }
</style>
