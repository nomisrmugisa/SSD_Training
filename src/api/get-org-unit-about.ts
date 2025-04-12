import axiosInstance from './base-api';
import {
  getOrgUnitAboutResponse,
  GroupActivities,
  Session,
} from '../types/org-unit-about';

export async function getOrgUnitAbout(id: string) {
  const response = await axiosInstance.get<getOrgUnitAboutResponse>(
    `${process.env.REACT_APP_DHIS2_BASE_URL}api/trackedEntityInstances/${id}.json?program=n2iAPy3PGx7&fields=enrollments[events[event,dataValues[dataElement,value]]`
    // `/api/trackedEntityInstances/${id}.json?program=n2iAPy3PGx7&fields=enrollments[events[event,dataValues[dataElement,value]]` //wth proxy
  );

  // console.log("response", response);
  const sessions: Session[] = [];
  const groupActivities: GroupActivities[] = [];

  response.data.enrollments.forEach((enrollment) => {
    enrollment.events.forEach((event) => {
      if (event.dataValues.length === 5) {
        groupActivities.push({
          id: event.event,
          name: event.dataValues[0].value,
          code: event.dataValues[1].value,
          directIndirect: event.dataValues[2].value,
          age: event.dataValues[3].value,
          sex: event.dataValues[4].value,
        });
      }
      if (event.dataValues.length === 3) {
        sessions.push({
          age: "", sex: "", name: '',
          id: event.event,
          code: event.dataValues[0].value,
          sessions: [event.dataValues[1].value, event.dataValues[2].value]
        });
      }
    });
  });

  const groupedSessions: Session[] = [];

  sessions.forEach((session) => {
    const existingSession = groupedSessions.find(
      (s) => s.code === session.code
    );
    if (existingSession) {
      existingSession.sessions.push(...session.sessions);
    } else {
      groupedSessions.push(session);
    }
  });

  // adding name, sex and age to the sessions array
  // Create a Map for fast lookup
  const groupActivitiesMap = new Map<string, { age: string, sex: string, name: string }>();
  groupActivities.forEach(activity => {
    groupActivitiesMap.set(activity.code, {name: activity.name, age: activity.age, sex: activity.sex });
  });

  // Update sessions with age and sex
  sessions.forEach(session => {
    const groupActivity = groupActivitiesMap.get(session.code);
    if (groupActivity) {
      session.age = groupActivity.age;
      session.sex = groupActivity.sex;
      session.name = groupActivity.name;
    }
  });

  return { sessions, groupActivities };
}
