## SpecStory

## Conditional Icon Display in Svelte (19/12/2024, 14:22:45)

_**User**_

we have two icons in the topbar: close and clear. The icons for close and clear are loaded in appcontainer, but I want to setup a conditional statement based on changes to show these icons. I want to setup a binding so that appcontainer.svelte is synced with the values of changes

---

_**Assistant**_

To implement the conditional display of the close and clear icons in `AppContainer.svelte` based on the `changes` value, you can follow these steps:

1. **Pass the `changes` value from `AppLoader.svelte` to `AppContainer.svelte`.**
2. **Use a conditional statement in `AppContainer.svelte` to show or hide the icons based on the `changes` value.**

Here’s how you can modify the relevant parts of your code:

### Step 1: Update `AppLoader.svelte`

You need to pass the `changes` value to the `AppContainer` component.

```svelte
```src/routes/components/AppLoader.svelte
...
403| <AppContainer
404|   open="{$CurrentApp !== null &&
405|     $CurrentApp !== DEFAULT_APP &&
406|     isValidApp($CurrentApp)}"
407|   on:close="{() => saveData(true)}"
408|   on:saveToFile="{() => saveToFile()}"
409|   on:clearCanvasBegin="{() => clearCanvas()}"
410|   {changes}  // Pass changes to AppContainer
411| >
...
```

### Step 2: Update `AppContainer.svelte`

In `AppContainer.svelte`, you will need to accept the `changes` prop and use it to conditionally render the icons.

```svelte
```src/routes/components/AppContainer.svelte
...
5|   export let open = false;
6|   export let changes; // Accept changes as a prop
...
10| {#if open}
11|   <div
12|     class="app-container"
13|     in:fly="{{ y: 100, duration: 280, opacity: 0 }}"
14|     out:fly="{{ y: 100, duration: 200, opacity: 0 }}"
15|   >
16|     <div class="top-controls">
17|       {#if changes > 0} <!-- Conditional rendering based on changes -->
18|         <button 
19|           class="control-button"
20|           on:click="{() => {
21|             dispatch('close');
22|           }}"
23|         >
24|           <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
25|         </button>
26|         <button 
27|           class="control-button"
28|           on:click={() => dispatch('clearCanvasBegin')}
29|         >
30|           <img alt="Clear canvas" src="assets/SHB/svg/AW-icon-trashcan.svg" class="red-icon" />
31|         </button>
32|       {/if}
33|     </div>
...
```

### Explanation of Changes

- **Passing `changes`**: In `AppLoader.svelte`, the `changes` variable is passed to the `AppContainer` component, allowing it to access the current state of changes.
- **Conditional Rendering**: In `AppContainer.svelte`, the buttons for closing and clearing the canvas are wrapped in a conditional block that checks if `changes` is greater than 0. This means the buttons will only be displayed if there are changes to save.

This setup ensures that the icons are displayed conditionally based on the state of `changes`, providing a more dynamic user interface.

---

_**User**_

I want to conditionally render this: when changes is 0 I want assets/SHB/svg/AW-icon-close.svg when changes is bigger then 0 I want assets/SHB/svg/AW-icon-check.svg

---

_**Assistant**_

To conditionally render the close icon based on the value of `changes`, you can use a simple conditional expression in your `AppContainer.svelte` file. Here's how you can modify the relevant part of your code:

### Updated Code for `AppContainer.svelte`

You will replace the existing `<img>` tag for the close icon with a conditional expression that checks the value of `changes`.

```svelte
{#if changes > 0}
  <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
{:else}
  <img alt="Close" src="assets/SHB/svg/AW-icon-close.svg" />
{/if}
```

### Full Example in Context

Here’s how the relevant section of your `AppContainer.svelte` might look after the update:

```svelte
<div class="top-controls">
  <button 
    class="control-button"
    on:click="{() => {
      dispatch('close');
    }}"
  >
    {#if changes > 0}
      <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
    {:else}
      <img alt="Close" src="assets/SHB/svg/AW-icon-close.svg" />
    {/if}
  </button>
  <button 
    class="control-button"
    on:click={() => dispatch('clearCanvasBegin')}
  >
    <img alt="Clear canvas" src="assets/SHB/svg/AW-icon-trashcan.svg" class="red-icon" />
  </button>
</div>
```

### Explanation of Changes

- **Conditional Rendering**: The `<img>` tag for the close icon is now wrapped in an `{#if}` block that checks if `changes` is greater than 0. If it is, it displays the check icon (`AW-icon-check.svg`); otherwise, it displays the close icon (`AW-icon-close.svg`).
- **Dynamic Icon**: This allows the icon to change dynamically based on the state of `changes`, providing a clear visual indication of whether there are unsaved changes or not.

---

_**User**_

I want this icon to be rotated 45 deg

---

_**Assistant**_

To rotate the icon by 45 degrees in your `AppContainer.svelte`, you can use CSS to apply a transformation to the `<img>` element. Here’s how you can do it:

### Updated Code for `AppContainer.svelte`

You can add a CSS class to the `<img>` tag and define the rotation in your styles. Here’s how to implement it:

```svelte
<img alt="Close" src="assets/SHB/svg/AW-icon-plus.svg" class="rotated-icon" />
```

### CSS for Rotation

Add the following CSS to your `<style>` section in `AppContainer.svelte`:

```css
<style>
  .rotated-icon {
    transform: rotate(45deg);
    /* Optional: Adjust the transform origin if needed */
    transform-origin: center; /* This ensures the rotation happens around the center of the icon */
  }
</style>
```

### Full Example in Context

Here’s how the relevant section of your `AppContainer.svelte` might look after the update:

```svelte
<div class="top-controls">
  <button 
    class="control-button"
    on:click="{() => {
      dispatch('close');
    }}"
  >
    {#if changes > 0}
      <img alt="Close" src="assets/SHB/svg/AW-icon-check.svg" />
    {:else}
      <img alt="Close" src="assets/SHB/svg/AW-icon-close.svg" />
    {/if}
  </button>
  <button 
    class="control-button"
    on:click={() => dispatch('clearCanvasBegin')}
  >
    <img alt="Add" src="assets/SHB/svg/AW-icon-plus.svg" class="rotated-icon" />
  </button>
</div>

<style>
  .rotated-icon {
    transform: rotate(45deg);
    transform-origin: center; /* Optional: Adjust the transform origin if needed */
  }
</style>
```

### Explanation of Changes

- **CSS Class**: A new class called `rotated-icon` is added to the `<img>` tag for the plus icon.
- **Transform Property**: The `transform: rotate(45deg);` CSS property is used to rotate the icon by 45 degrees.
- **Transform Origin**: The `transform-origin: center;` property ensures that the rotation occurs around the center of the icon, which can help maintain its position visually.

This will effectively rotate the plus icon by 45 degrees when rendered.

---



---

