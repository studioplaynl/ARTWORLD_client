import { writable } from 'svelte/store'

const history = writable([])

export default history