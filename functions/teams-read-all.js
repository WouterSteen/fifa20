/* Import faunaDB sdk */
const faunadb = require('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SERVER_SECRET
})

exports.handler = (event, context) => {
  console.log('Function `Team-read-all` invoked')
  return client.query(q.Paginate(q.Match(q.Ref('indexes/all_teams'))))
    .then((response) => {
      const TeamRefs = response.data
      console.log('Team refs', TeamRefs)
      console.log(`${TeamRefs.length} Teams found`)
      // create new query out of Team refs. http://bit.ly/2LG3MLg
      const getAllTeamDataQuery = TeamRefs.map((ref) => {
        return q.Get(ref)
      })
      // then query the refs
      return client.query(getAllTeamDataQuery).then((ret) => {
        return {
          statusCode: 200,
          body: JSON.stringify(ret)
        }
      })
    }).catch((error) => {
      console.log('error', error)
      return {
        statusCode: 400,
        body: JSON.stringify(error)
      }
    })
}
