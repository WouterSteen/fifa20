/* Api methods to call /functions */

const readAll = () => {
  return fetch('/.netlify/functions/teams-read-all').then((response) => {
    return response.json()
  })
}

const update = (teamId, data) => {
  console.log(teamId)
  console.log(data)
  return fetch(`/.netlify/functions/teams-update/${teamId}`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

export default {
  readAll: readAll,
  update: update,
}
