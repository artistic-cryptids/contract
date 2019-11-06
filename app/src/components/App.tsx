import * as React from 'react';
import { DrizzleContext } from 'drizzle-react';
import NetworkAside from './NetworkAside';
import HomePageNoAccount from './HomePageNoAccount';

import Container from 'react-bootstrap/Container';

import { ArtifactView, ProposalView, ARRView, RegisterView, RegisterArtistView, ClientArtifactView } from '../views';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LeftSidebar from './LeftSidebar';

const App: React.FC = () => {
  return (
    <Router>
      <LeftSidebar>
        <div className="content h-100">
          <DrizzledApp/>
        </div>
      </LeftSidebar>
    </Router>
  );
};

const DrizzledApp: React.FC = () => {
  return <DrizzleContext.Consumer>
    {(drizzleContext: any): React.ReactNode => {
      const { drizzle, drizzleState, initialized } = drizzleContext;
      return initialized ? (
        <>
          <NetworkAside drizzle={drizzle}/>
          <Switch>
            <Route exact path="/">
              <HomePageNoAccount/>
            </Route>
            <Route path="/artifacts">
              <ArtifactView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
            <Route path="/new">
              <RegisterView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
            <Route path="/proposal">
              <ProposalView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
            <Route path="/arr">
              <ARRView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
            <Route path ="/new_artist">
              <RegisterArtistView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
            <Route path="/clientArtifacts">
              <ClientArtifactView drizzle={drizzle} drizzleState={drizzleState}/>
            </Route>
          </Switch>
        </>
      ) : null;
    }}
  </DrizzleContext.Consumer>;
};

export default App;
