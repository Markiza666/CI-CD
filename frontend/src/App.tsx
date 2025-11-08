import React from 'react';
// Importera React Router DOM-komponenter
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importera Autentiserings- och Skyddskomponenter
// Dessa hanterar det faktiska inloggade/utloggade tillståndet
import { AuthProvider } from './context/authContext'; 
import ProtectedRoute from './components/protectedRoute';

// Importera alla huvudkomponenter och sidor
import RegisterForm from './components/registerForm'; 
import LoginForm from './components/loginForm';     
import MeetupList from './components/meetupList.module/meetupList';   
import ProfilePage from './pages/profilePage';      
import MeetupDetail from './pages/meetupDetail'; 
import Header from './components/header';           
import CreateMeetupForm from './components/createMeetupForm';
import EditMeetupForm from './components/editMeetupForm';

// Importera SCSS-moduler för layout och typografi
// Observera att dessa importerar stilarna som objekt
import layoutStyles from './styles/layout/layout.module.scss';
import typographyStyles from './styles/base/errors.module.scss';

const App: React.FC = () => {
    return (
        // 1. Omsluter hela appen med AuthProvider för att tillhandahålla inloggningsstatus
        <AuthProvider>
            <Router>
                {/* Header visas på ALLA sidor */}
                <Header />
                
                {/* Huvudinnehållet använder layout-stilen för att centrera/begränsa bredden */}
                <main className={layoutStyles.container}>
                    <Routes>
                        
                        {/* 🗺️ Publika Rutter (Kräver EJ inloggning) */}
                        <Route path="/" element={<MeetupList />} /> 
                        <Route path="/register" element={<RegisterForm />} />
                        <Route path="/login" element={<LoginForm />} />
                        <Route path="/meetups/:id" element={<MeetupDetail />} />

                        
                        {/* --- 🔒 Skyddade Rutter (Kräver INLOGGNING) --- */}
                        
                        {/* ProtectedRoute kollar 'isAuthenticated' och omdirigerar vid misslyckande */}
                        <Route element={<ProtectedRoute />}>
                            
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/create-meetup" element={<CreateMeetupForm />} />
                            <Route path="/meetups/edit/:id" element={<EditMeetupForm />} /> 
                        </Route>
                        

                        {/* 404 / Catch-all Page */}
                        <Route path="*" element={
                            <h2 className={typographyStyles.err}>
                                404 - Page is not found!
                            </h2>
                        } />
                    </Routes>
                </main>
            </Router>
        </AuthProvider>
    );
};

export default App;
