import React, {useEffect} from 'react';
import firebase from 'firebase';
import {Route, Switch, useHistory, useLocation} from 'react-router-dom';
import {Actions, State, useStoreActions, useStoreState} from 'easy-peasy';
import {LoginPage} from './login/pages';
import {SchoolPage} from './school/pages';
import {auth, firestore} from './utils/firebase';
import {StoreModel} from './store';
import './App.css';

interface Redirects {
  [userType: string]: string;
}

interface SchoolDocument {
  city: string
}

interface UserDocument extends firebase.firestore.DocumentData {
  name: string;
  school: firebase.firestore.DocumentSnapshot<SchoolDocument>;
  type: string;
}

const redirects: Redirects = {
  teacher: '/escola/home',
  'school-admin': '/escola/home',
};

const App: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const { closeSession, startSession } = useStoreActions(({ loggedUser }: Actions<StoreModel>) => loggedUser);
  const { type, fetching } = useStoreState(({ loggedUser }: State<StoreModel>) => loggedUser);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async user => {
      if (!user) {
        closeSession();
        return;
      }
      const userDocumentSnapshot: firebase.firestore.DocumentSnapshot<UserDocument> = await firestore
        .collection('users')
        .doc(user?.email!)
        .get() as firebase.firestore.DocumentSnapshot<UserDocument>;
      const userData: UserDocument = userDocumentSnapshot.data() as UserDocument;
      const schoolDocumentSnapshot: firebase.firestore.DocumentSnapshot<SchoolDocument> = await firestore
        .collection('schools')
        .doc(userData.school.id)
        .get() as firebase.firestore.DocumentSnapshot<SchoolDocument>;
      const userSchoolData: SchoolDocument = schoolDocumentSnapshot.data() as SchoolDocument;
      startSession({ email: user.email!, name: userData.name, type: userData.type, school: { id: userData.school.id, ...userSchoolData } });
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (fetching) return;
    if (!type) {
      if (location.pathname === '/login') return;
      history.push('/login');
    }
    if (location.pathname === '/login' || location.pathname === '/') {
      history.push(redirects[type]);
    }
  }, [history, location, type, fetching]);
  return (
    <Switch>
      <Route exact path={['', '/login']}>
        <LoginPage />
      </Route>
      <Route path="/escola/*">
        { type && <SchoolPage /> }
      </Route>
    </Switch>
  );
};

export default App;
