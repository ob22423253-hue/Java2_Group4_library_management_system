import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StudentForm from './components/Student/StudentForm';
import StudentLogin from './components/Student/StudentLogin';
import EntryForm from './components/LibraryEntry/EntryForm';
import LibrarianDashboard from './components/Librarian/LibrarianDashboard';

function Home() {
	return (
		<div style={{textAlign: 'center', padding: '40px 20px', backgroundColor: '#f0f0f0', minHeight: '100vh'}}>
			<div style={{backgroundColor: 'white', borderRadius: '8px', padding: '40px', maxWidth: '800px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}}>
				<h1 style={{fontSize: '2.5em', color: '#333', marginBottom: '10px'}}>📚 University Library System</h1>
				<p style={{fontSize: '1.1em', color: '#666', marginBottom: '40px'}}>Comprehensive library management for students and staff</p>
				
				<div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px'}}>
					{/* Students Section */}
					<div style={{backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
						<h2 style={{fontSize: '1.5em', marginBottom: '10px', color: '#333'}}>👨‍🎓 Students</h2>
						<p style={{color: '#666', marginBottom: '20px', fontSize: '0.95em'}}>Access your library profile and scan in/out</p>
						<Link to="/student-login" style={{display: 'inline-block', backgroundColor: '#007bff', color: 'white', padding: '12px 30px', marginRight: '10px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '10px'}}>Student Login</Link>
						<Link to="/student-register" style={{display: 'inline-block', backgroundColor: '#28a745', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'}}>Student Register</Link>
					</div>
					
					{/* Librarian Section */}
					<div style={{backgroundColor: '#f9f9f9', padding: '30px', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
						<h2 style={{fontSize: '1.5em', marginBottom: '10px', color: '#333'}}>👨‍💼 Library Staff</h2>
						<p style={{color: '#666', marginBottom: '20px', fontSize: '0.95em'}}>Manage library operations and analytics</p>
						<Link to="/librarian-login" style={{display: 'inline-block', backgroundColor: '#ff9800', color: 'white', padding: '12px 30px', marginRight: '10px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '10px'}}>Manager Login</Link>
						<Link to="/librarian-register" style={{display: 'inline-block', backgroundColor: '#ff5722', color: 'white', padding: '12px 30px', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold'}}>Manager Register</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function App() {
	useEffect(() => {
		// Suppress noisy ResizeObserver loop errors from some QR/third-party libs in dev
		const handler = (e) => {
			if (e && e.message && e.message.includes('ResizeObserver loop')) {
				e.stopImmediatePropagation();
			}
		};
		window.addEventListener('error', handler);
		return () => window.removeEventListener('error', handler);
	}, []);
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home/>} />
				<Route path="/student-register" element={<StudentForm/>} />
				<Route path="/student-login" element={<StudentLogin/>} />
				<Route path="/librarian-login" element={<StudentLogin/>} />
				<Route path="/librarian-register" element={<StudentForm/>} />
				<Route path="/scan" element={<EntryForm/>} />
				<Route path="/librarian" element={<LibrarianDashboard/>} />
			</Routes>
		</BrowserRouter>
	);
}
