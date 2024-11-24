import { observer } from "mobx-react";
import React from "react";
import { HeaderBar } from "@dhis2/ui-widgets";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import {OrgUnitSearchSection} from "./components/org-unit-search";
import {OrgUnitDetails} from "./components/org-unit-details";
import {OrgUnitAbout} from "./components/org-unit-about";
import {SessionsPage} from "./components/sessions";



export const App = observer(() => {

  return (
      <>
          {/* <HeaderBar
              appName={"Group Activities"}
              style={{
                  left: 0,
                  position: "fixed",
                  top: 0,
                  width: "100%",
                  zIndex: 1000,
              }}
          /> */}
          <Router>
              <Switch>
                  <Route exact path="/">
                      <OrgUnitSearchSection />
                  </Route>
                  <Route exact path="/:orgUnitId">
                      <OrgUnitDetails />
                  </Route>
                  {/* <Route exact path="/:orgUnitId/:detailsId/about">
                      <OrgUnitAbout />
                  </Route>
                  <Route exact path="/:orgUnitId/:detailsId/sessions">
                      <SessionsPage />
                  </Route> */}
              </Switch>
          </Router>

      </>

  );
});