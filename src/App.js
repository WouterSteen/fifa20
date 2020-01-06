import React, { Component } from 'react'
import api from './utils/api'
import isLocalHost from './utils/isLocalHost'
import './App.css'

export default class App extends Component {
  state = {}

  componentDidMount() {
    // Fetch all teams
    api.readAll().then((teams) => {
      if (teams.message === 'unauthorized') {
        if (isLocalHost()) {
          alert('FaunaDB key is not unauthorized. Make sure you set it in terminal session where you ran `npm start`. Visit http://bit.ly/set-fauna-key for more info')
        } else {
          alert('FaunaDB key is not unauthorized. Verify the key `FAUNADB_SERVER_SECRET` set in Netlify enviroment variables is correct')
        }
        return false
      }

      console.log('all teams', teams)
      this.setState({
        teams
      })
    })
  }

  saveScore = (event) => {
    const { teams } = this.state
    const teamId = event.target.dataset.id
    let currentScore = event.target.dataset.currentScore
    let newScore;

    if (event.target.dataset.operator === 'minus') {
      newScore = --currentScore;
    } else {
      newScore = ++currentScore;
    }

    console.log(newScore);
    const updatedScores = teams.map((team, i) => {
      const { data } = team
      const id = getTeamId(team)
      if (id === teamId) {
        data.score = newScore;
      }
      return team
    })

    console.log(updatedScores);

    this.setState({
      updatedScores
    }, () => {
      api.update(teamId, {
        score: newScore
      }).then(() => {
        console.log(`update team ${teamId}`, newScore)
      }).catch((e) => {
        console.log('An API error occurred', e)
      })
    })

  }

  renderTeams() {
    const { teams } = this.state

    if (!teams || !teams.length) {
      // Loading State here
      return null
    }

    return teams.map((team, i) => {
      const { data, ref } = team
      const id = getTeamId(team)

      // only show delete button after create API response returns
      return (
          <div className="btncontainer" key={i}>
            <h2>{data.team}</h2>
            <div className="btn">
              {data.score}
            </div>

            <button className='scorebtn' data-id={id} data-current-score={data.score} data-operator={"plus"} onClick={this.saveScore}>
              +
            </button>

            <button className="scorebtn" data-id={id} data-current-score={data.score} data-operator={"minus"} onClick={this.saveScore}>-</button>
          </div>
      )
    })
  }

  render() {
    return (
        <div className="App">
          <main>
            <header>
              <h1 className="text-center">FIFA20 Scoreboard</h1>
            </header>
            <div className="scorecontainer">
              {this.renderTeams()}
            </div>
          </main>
        </div>
    )
  }
}

function getTeamId(team) {
  if (!team.ref) {
    return null
  }
  return team.ref['@ref'].id
}
