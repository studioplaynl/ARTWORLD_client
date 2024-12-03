<script context="module">
// @ts-nocheck

  import { Client } from '@heroiclabs/nakama-js';

  export const SSL = true;

  export const client = new Client(
    import.meta.env.VITE_NAKAMA_SERVER_TOKEN,
    import.meta.env.VITE_IP_ADDRESS,
    '',
    SSL,
  );
</script>
