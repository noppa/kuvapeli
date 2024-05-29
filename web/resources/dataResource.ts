import { createResource } from 'solid-js'

const loginPromise = null

async function login() {}

const [data, { mutate, refetch }] = createResource(
  async function fetchData() {},
  { deferStream },
)
