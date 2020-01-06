import React, { Component } from 'react'
import api from './utils/api'
import isLocalHost from './utils/isLocalHost'
import './App.css'

export default class App extends Component {
  state = {}


  componentDidMount() {
    // Fetch all todos
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
    let newScore = ++currentScore;

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
        console.log(`update todo ${teamId}`, newScore)
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
          <div className={"team"} key={i}>
            <h2>{data.team}</h2>
            <h1>{data.score}</h1>
            <button className='todo-create-button' data-id={id} data-current-score={data.score} onClick={this.saveScore}>
              +1
            </button>
          </div>
      )
    })
  }
  render() {
    return (
        <div className="App">
          <main>
            {this.renderTeams()}
          </main>
        </div>
    )
  }
}

function removeOptimisticTodo(todos) {
  // return all 'real' todos
  return todos.filter((todo) => {
    return todo.ref
  })
}

function getTeamId(team) {
  if (!team.ref) {
    return null
  }
  return team.ref['@ref'].id
}
