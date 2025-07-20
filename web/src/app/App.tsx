import { Fragment } from 'react'
import { GameControls } from '../components/GameControls'
import { GameStateDisplay } from '../components/GameStateDisplay'
import { PlayerActions } from '../components/PlayerActions'
import './App.css'

function App(): React.JSX.Element {
  return (
    <Fragment>
      <div className="card">
        <PlayerActions />
        <GameControls />
        <GameStateDisplay />
      </div>
    </Fragment>
  )
}

export default App
