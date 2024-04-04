<script context="module">
  import { Client } from '@heroiclabs/nakama-js';

  export const SSL = false;

  export const client = new Client(
    'NAKAMA_SERVER_TOKEN',
    'IP_ADDRESS',
    '7350',
    SSL,
  );
</script>