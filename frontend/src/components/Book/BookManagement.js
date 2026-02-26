import React, { useState, useEffect } from 'react';
import bookService from '../../services/bookService';

const PAGE_SIZE = 8;
const COLORS = {
  primary: '#003d7a', primaryLight: '#e8f0fb',
  success: '#2e7d32', successLight: '#e8f5e9',
  danger: '#c62828', dangerLight: '#ffebee',
  gray: '#757575', grayLight: '#f5f5f5',
  border: '#e0e0e0', white: '#ffffff',
};

function StatusBadge({ record }) {
  if (record.returnDate || record.status === 'RETURNED')
    return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.success, backgroundColor:COLORS.successLight }}>✓ Returned</span>;
  const isOverdue = new Date() > new Date(record.dueDate);
  if (isOverdue)
    return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.danger, backgroundColor:COLORS.dangerLight }}>⚠ Overdue</span>;
  return <span style={{ display:'inline-block', padding:'3px 10px', borderRadius:20, fontSize:'0.78em', fontWeight:700, color:COLORS.primary, backgroundColor:COLORS.primaryLight }}>📖 Borrowed</span>;
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <span style={{ fontSize:'0.82em', color:COLORS.gray }}>Page {page+1} of {totalPages}</span>
      <div style={{ display:'flex', gap:6 }}>
        <button onClick={() => onPageChange(Math.max(0,page-1))} disabled={page===0}
          style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===0?'not-allowed':'pointer', backgroundColor:page===0?COLORS.grayLight:COLORS.white, fontWeight:600, fontSize:'0.85em' }}>← Prev</button>
        {Array.from({length:totalPages},(_,i) => (
          <button key={i} onClick={() => onPageChange(i)}
            style={{ padding:'5px 11px', border:`1px solid ${i===page?COLORS.primary:COLORS.border}`, borderRadius:5, cursor:'pointer', backgroundColor:i===page?COLORS.primary:COLORS.white, color:i===page?'white':'#222', fontWeight:600, fontSize:'0.85em' }}>{i+1}</button>
        ))}
        <button onClick={() => onPageChange(Math.min(totalPages-1,page+1))} disabled={page===totalPages-1}
          style={{ padding:'5px 14px', border:`1px solid ${COLORS.border}`, borderRadius:5, cursor:page===totalPages-1?'not-allowed':'pointer', backgroundColor:page===totalPages-1?COLORS.grayLight:COLORS.white, fontWeight:600, fontSize:'0.85em' }}>Next →</button>
      </div>
    </div>
  );
}

export default function BookManagement({ students }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('books');
  const [search, setSearch] = useState('');
  const [bookPage, setBookPage] = useState(0);

  const [showBookForm, setShowBookForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [bookForm, setBookForm] = useState({
    title:'', author:'', isbn:'', category:'', publisher:'',
    totalCopies:1, locationCode:'', publicationYear:new Date().getFullYear()
  });

  const [borrowForm, setBorrowForm] = useState({ studentId:'', bookId:'', dueDate:'' });
  const [borrowLoading, setBorrowLoading] = useState(false);

  const [allBorrows, setAllBorrows] = useState([]);
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [borrowsLoading, setBorrowsLoading] = useState(false);
  const [returnPage, setReturnPage] = useState(0);
  const [returnFilter, setReturnFilter] = useState('ACTIVE');

  async function loadBooks() {
    setLoading(true);
    try {
      const res = await bookService.getAllBooks();
      const data = res?.content ?? (Array.isArray(res) ? res : res?.data ?? []);
      setBooks(Array.isArray(data) ? data : []);
    } catch (e) {
      setMessage({ type:'error', text:'Failed to load books: '+e.message });
    } finally { setLoading(false); }
  }

  useEffect(() => { loadBooks(); }, []);

  function openAddBook() {
    setEditingBook(null);
    setBookForm({ title:'', author:'', isbn:'', category:'', publisher:'', totalCopies:1, locationCode:'', publicationYear:new Date().getFullYear() });
    setShowBookForm(true);
  }

  function openEditBook(book) {
    setEditingBook(book);
    setBookForm({ title:book.title||'', author:book.author||'', isbn:book.isbn||'', category:book.category||'', publisher:book.publisher||'', totalCopies:book.totalCopies||1, locationCode:book.locationCode||'', publicationYear:book.publicationYear||new Date().getFullYear() });
    setShowBookForm(true);
  }

  async function handleBookSubmit() {
    if (!bookForm.title || !bookForm.author || !bookForm.isbn) { setMessage({ type:'error', text:'Title, Author and ISBN are required' }); return; }
    if (!bookForm.locationCode) { setMessage({ type:'error', text:'Location Code is required (e.g. FIC-001)' }); return; }
    try {
      if (editingBook) {
        await bookService.updateBook(editingBook.id, { ...bookForm, totalCopies:parseInt(bookForm.totalCopies), publicationYear:parseInt(bookForm.publicationYear) });
        setMessage({ type:'success', text:'Book updated successfully' });
      } else {
        await bookService.addBook({ ...bookForm, availableCopies:parseInt(bookForm.totalCopies), totalCopies:parseInt(bookForm.totalCopies), publicationYear:parseInt(bookForm.publicationYear) });
        setMessage({ type:'success', text:'Book added successfully' });
      }
      setShowBookForm(false);
      loadBooks();
    } catch (e) { setMessage({ type:'error', text:e.message }); }
  }

  async function handleDeleteBook(id) {
    if (!window.confirm('Delete this book? This cannot be undone.')) return;
    try {
      await bookService.deleteBook(id);
      setMessage({ type:'success', text:'Book deleted successfully' });
      loadBooks();
    } catch (e) { setMessage({ type:'error', text:e.message }); }
  }

  async function handleBorrow() {
    if (!borrowForm.studentId || !borrowForm.bookId || !borrowForm.dueDate) { setMessage({ type:'error', text:'Please fill in all borrow fields' }); return; }
    setBorrowLoading(true);
    try {
      const res = await fetch('/api/v1/borrow-records/borrow', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+localStorage.getItem('token') },
        body:JSON.stringify({ studentId:parseInt(borrowForm.studentId), bookId:parseInt(borrowForm.bookId), dueDate:borrowForm.dueDate })
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setMessage({ type:'success', text:'Book borrowed successfully' });
        setBorrowForm({ studentId:'', bookId:'', dueDate:'' });
        loadBooks();
      } else {
        setMessage({ type:'error', text:data?.message||'Failed to borrow book' });
      }
    } catch (e) { setMessage({ type:'error', text:e.message }); }
    finally { setBorrowLoading(false); }
  }

  async function loadStudentBorrows(studentDbId) {
    if (!studentDbId) { setActiveBorrows([]); setAllBorrows([]); return; }
    setBorrowsLoading(true);
    try {
      const res = await fetch(`/api/v1/borrow-records/student/${studentDbId}?size=200`, {
        headers:{ 'Authorization':'Bearer '+localStorage.getItem('token') }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      const list = data?.data?.content ?? data?.data ?? (Array.isArray(data) ? data : []);
      const all = Array.isArray(list) ? list : [];
      setAllBorrows(all);
      setActiveBorrows(all.filter(r => r.status === 'BORROWED'));
    } catch { setActiveBorrows([]); setAllBorrows([]); }
    finally { setBorrowsLoading(false); }
  }

  async function handleReturn(borrowRecordId) {
    if (!window.confirm('Confirm return of this book?')) return;
    try {
      const res = await fetch(`/api/v1/borrow-records/${borrowRecordId}/return`, {
        method:'PUT', headers:{ 'Authorization':'Bearer '+localStorage.getItem('token') }
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (res.ok) {
        setMessage({ type:'success', text:'Book returned successfully' });
        loadStudentBorrows(selectedStudentId);
        loadBooks();
      } else {
        setMessage({ type:'error', text:data?.message||'Failed to return book' });
      }
    } catch (e) { setMessage({ type:'error', text:e.message }); }
  }

  const filteredBooks = books.filter(b =>
    !search || b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.author?.toLowerCase().includes(search.toLowerCase()) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );
  const totalBookPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice(bookPage * PAGE_SIZE, bookPage * PAGE_SIZE + PAGE_SIZE);

  const displayBorrows = returnFilter === 'ACTIVE' ? activeBorrows : allBorrows;
  const totalReturnPages = Math.ceil(displayBorrows.length / PAGE_SIZE);
  const paginatedBorrows = displayBorrows.slice(returnPage * PAGE_SIZE, returnPage * PAGE_SIZE + PAGE_SIZE);

  const tabStyle = (tab) => ({
    padding:'10px 22px', border:'none', cursor:'pointer', fontSize:'0.92em',
    fontWeight:activeTab===tab?700:500,
    borderBottom:activeTab===tab?`3px solid ${COLORS.primary}`:'3px solid transparent',
    backgroundColor:'transparent', color:activeTab===tab?COLORS.primary:COLORS.gray,
  });

  return (
    <div>
      {message && (
        <div style={{ marginBottom:15, padding:'12px 16px', backgroundColor:message.type==='error'?COLORS.dangerLight:COLORS.successLight, color:message.type==='error'?COLORS.danger:COLORS.success, border:`1px solid ${message.type==='error'?COLORS.danger:COLORS.success}`, borderRadius:6 }}>
          {message.text}
          <button onClick={() => setMessage(null)} style={{ float:'right', background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>✕</button>
        </div>
      )}

      <div style={{ borderBottom:`1px solid ${COLORS.border}`, marginBottom:20 }}>
        <button style={tabStyle('books')} onClick={() => setActiveTab('books')}>📚 Book Inventory</button>
        <button style={tabStyle('borrow')} onClick={() => setActiveTab('borrow')}>📤 Borrow a Book</button>
        <button style={tabStyle('return')} onClick={() => setActiveTab('return')}>📥 Return / History</button>
      </div>

      {/* BOOK INVENTORY */}
      {activeTab === 'books' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:15, flexWrap:'wrap' }}>
            <input type="text" placeholder="Search by title, author, category..." value={search}
              onChange={e => { setSearch(e.target.value); setBookPage(0); }}
              style={{ flex:1, minWidth:200, padding:'8px 12px', border:`1px solid ${COLORS.border}`, borderRadius:5 }} />
            <button onClick={openAddBook} style={{ padding:'8px 20px', backgroundColor:COLORS.primary, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontWeight:700 }}>+ Add Book</button>
            <button onClick={loadBooks} style={{ padding:'8px 16px', backgroundColor:'#2196f3', color:'white', border:'none', borderRadius:5, cursor:'pointer' }}>↻ Refresh</button>
          </div>

          {showBookForm && (
            <div style={{ marginBottom:20, padding:20, backgroundColor:COLORS.grayLight, borderRadius:8, border:`1px solid ${COLORS.border}` }}>
              <h4 style={{ margin:'0 0 15px', color:COLORS.primary }}>{editingBook?'Edit Book':'Add New Book'}</h4>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  {label:'Title *',key:'title',type:'text',placeholder:'e.g. The Great Gatsby'},
                  {label:'Author *',key:'author',type:'text',placeholder:'e.g. F. Scott Fitzgerald'},
                  {label:'ISBN *',key:'isbn',type:'text',placeholder:'978-3-16-148410-0'},
                  {label:'Location Code * (e.g. FIC-001)',key:'locationCode',type:'text',placeholder:'FIC-001'},
                  {label:'Publication Year *',key:'publicationYear',type:'number',placeholder:'2024'},
                  {label:'Category',key:'category',type:'text',placeholder:'e.g. Fiction'},
                  {label:'Publisher',key:'publisher',type:'text',placeholder:'e.g. Penguin Books'},
                  {label:'Total Copies',key:'totalCopies',type:'number',placeholder:'1'},
                ].map(({label,key,type,placeholder}) => (
                  <div key={key}>
                    <label style={{ fontSize:'0.82em', color:COLORS.gray, display:'block', marginBottom:4 }}>{label}</label>
                    <input type={type} value={bookForm[key]} placeholder={placeholder}
                      onChange={e => setBookForm(p => ({...p,[key]:e.target.value}))}
                      style={{ width:'100%', padding:'8px', border:`1px solid ${COLORS.border}`, borderRadius:5, boxSizing:'border-box' }} />
                  </div>
                ))}
              </div>
              <div style={{ marginTop:15, display:'flex', gap:10 }}>
                <button onClick={handleBookSubmit} style={{ padding:'8px 24px', backgroundColor:COLORS.success, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontWeight:700 }}>{editingBook?'Update Book':'Save Book'}</button>
                <button onClick={() => setShowBookForm(false)} style={{ padding:'8px 24px', backgroundColor:'#9e9e9e', color:'white', border:'none', borderRadius:5, cursor:'pointer' }}>Cancel</button>
              </div>
            </div>
          )}

          {loading ? <p style={{color:COLORS.gray}}>Loading books...</p> : (
            <>
              <div style={{ marginBottom:8, fontSize:'0.82em', color:COLORS.gray }}>Showing {filteredBooks.length} of {books.length} books</div>
              {filteredBooks.length === 0 ? (
                <p style={{ color:COLORS.gray, textAlign:'center', padding:20 }}>No books found</p>
              ) : (
                <>
                  <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:COLORS.white }}>
                      <thead>
                        <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
                          {['Title','Author','Category','ISBN','Total','Available','Actions'].map(h => (
                            <th key={h} style={{ padding:'11px 14px', textAlign:['Total','Available','Actions'].includes(h)?'center':'left', fontSize:'0.78em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedBooks.map((book,idx) => (
                          <tr key={book.id} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?COLORS.white:'#fafafa' }}>
                            <td style={{ padding:'11px 14px', fontWeight:600, fontSize:'0.9em' }}>{book.title}</td>
                            <td style={{ padding:'11px 14px', fontSize:'0.88em' }}>{book.author}</td>
                            <td style={{ padding:'11px 14px', fontSize:'0.85em', color:COLORS.gray }}>{book.category||'—'}</td>
                            <td style={{ padding:'11px 14px', fontFamily:'monospace', fontSize:'0.82em' }}>{book.isbn}</td>
                            <td style={{ padding:'11px 14px', textAlign:'center', fontWeight:600 }}>{book.totalCopies}</td>
                            <td style={{ padding:'11px 14px', textAlign:'center' }}>
                              <span style={{ padding:'3px 12px', borderRadius:20, fontWeight:700, fontSize:'0.82em', backgroundColor:book.availableCopies>0?COLORS.successLight:COLORS.dangerLight, color:book.availableCopies>0?COLORS.success:COLORS.danger }}>
                                {book.availableCopies > 0 ? `✓ ${book.availableCopies}` : '✕ None'}
                              </span>
                            </td>
                            <td style={{ padding:'11px 14px', textAlign:'center' }}>
                              <button onClick={() => openEditBook(book)} style={{ padding:'5px 12px', backgroundColor:'#ff9800', color:'white', border:'none', borderRadius:5, cursor:'pointer', marginRight:6, fontWeight:600, fontSize:'0.82em' }}>Edit</button>
                              <button onClick={() => handleDeleteBook(book.id)} style={{ padding:'5px 12px', backgroundColor:COLORS.danger, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontWeight:600, fontSize:'0.82em' }}>Delete</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination page={bookPage} totalPages={totalBookPages} onPageChange={setBookPage} />
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* BORROW */}
      {activeTab === 'borrow' && (
        <div style={{ maxWidth:500 }}>
          <h4 style={{ color:COLORS.primary, marginTop:0 }}>Record a Book Borrow</h4>
          <div style={{ display:'flex', flexDirection:'column', gap:15 }}>
            <div>
              <label style={{ fontSize:'0.85em', color:COLORS.gray, display:'block', marginBottom:4 }}>Select Student *</label>
              <select value={borrowForm.studentId} onChange={e => setBorrowForm(p => ({...p,studentId:e.target.value}))}
                style={{ width:'100%', padding:10, border:`1px solid ${COLORS.border}`, borderRadius:5 }}>
                <option value="">-- Select a student --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.studentId}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.85em', color:COLORS.gray, display:'block', marginBottom:4 }}>Select Book *</label>
              <select value={borrowForm.bookId} onChange={e => setBorrowForm(p => ({...p,bookId:e.target.value}))}
                style={{ width:'100%', padding:10, border:`1px solid ${COLORS.border}`, borderRadius:5 }}>
                <option value="">-- Select a book --</option>
                {books.filter(b => b.availableCopies > 0).map(b => (
                  <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.availableCopies} available)</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize:'0.85em', color:COLORS.gray, display:'block', marginBottom:4 }}>Due Date *</label>
              <input type="date" value={borrowForm.dueDate} min={new Date().toISOString().split('T')[0]}
                onChange={e => setBorrowForm(p => ({...p,dueDate:e.target.value}))}
                style={{ width:'100%', padding:10, border:`1px solid ${COLORS.border}`, borderRadius:5, boxSizing:'border-box' }} />
            </div>
            <button onClick={handleBorrow} disabled={borrowLoading}
              style={{ padding:12, backgroundColor:borrowLoading?'#ccc':COLORS.primary, color:'white', border:'none', borderRadius:5, cursor:borrowLoading?'not-allowed':'pointer', fontWeight:700, fontSize:'1em' }}>
              {borrowLoading ? 'Processing...' : '📤 Record Borrow'}
            </button>
          </div>
        </div>
      )}

      {/* RETURN / HISTORY */}
      {activeTab === 'return' && (
        <div>
          <h4 style={{ color:COLORS.primary, marginTop:0 }}>Return / Borrow History</h4>
          <div style={{ maxWidth:420, marginBottom:20 }}>
            <label style={{ fontSize:'0.85em', color:COLORS.gray, display:'block', marginBottom:4 }}>Select Student</label>
            <select value={selectedStudentId}
              onChange={e => { setSelectedStudentId(e.target.value); setReturnPage(0); loadStudentBorrows(e.target.value); }}
              style={{ width:'100%', padding:10, border:`1px solid ${COLORS.border}`, borderRadius:5 }}>
              <option value="">-- Select a student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} — {s.studentId}</option>
              ))}
            </select>
          </div>

          {selectedStudentId && (
            <div style={{ display:'flex', gap:8, marginBottom:16, alignItems:'center', flexWrap:'wrap' }}>
              {[['ACTIVE','Active Only'],['ALL','Full History']].map(([val,label]) => (
                <button key={val} onClick={() => { setReturnFilter(val); setReturnPage(0); }}
                  style={{ padding:'6px 16px', border:`1px solid ${returnFilter===val?COLORS.primary:COLORS.border}`, borderRadius:20, cursor:'pointer', fontSize:'0.85em', fontWeight:600, backgroundColor:returnFilter===val?COLORS.primary:'white', color:returnFilter===val?'white':COLORS.gray }}>
                  {label}
                </button>
              ))}
              <span style={{ marginLeft:'auto', fontSize:'0.82em', color:COLORS.gray }}>
                {activeBorrows.length} active · {allBorrows.length} total
              </span>
            </div>
          )}

          {borrowsLoading && <p style={{color:COLORS.gray}}>Loading...</p>}

          {!borrowsLoading && selectedStudentId && displayBorrows.length === 0 && (
            <p style={{ color:COLORS.gray, textAlign:'center', padding:20 }}>
              {returnFilter==='ACTIVE' ? 'This student has no active borrows' : 'No borrow history found'}
            </p>
          )}

          {!borrowsLoading && paginatedBorrows.length > 0 && (
            <>
              <div style={{ overflowX:'auto', borderRadius:8, border:`1px solid ${COLORS.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', backgroundColor:COLORS.white }}>
                  <thead>
                    <tr style={{ backgroundColor:COLORS.primary, color:'white' }}>
                      {['Book Title','Author','Borrow Date','Due Date','Return Date','Status','Action'].map(h => (
                        <th key={h} style={{ padding:'11px 14px', textAlign:'left', fontSize:'0.78em', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedBorrows.map((record,idx) => {
                      const isActive = record.status==='BORROWED' && !record.returnDate;
                      return (
                        <tr key={record.id} style={{ borderBottom:`1px solid ${COLORS.border}`, backgroundColor:idx%2===0?COLORS.white:'#fafafa' }}>
                          <td style={{ padding:'11px 14px', fontWeight:600, fontSize:'0.9em' }}>{record.book?.title||'—'}</td>
                          <td style={{ padding:'11px 14px', fontSize:'0.85em', color:COLORS.gray }}>{record.book?.author||'—'}</td>
                          <td style={{ padding:'11px 14px', fontSize:'0.82em', whiteSpace:'nowrap' }}>{record.borrowDate?new Date(record.borrowDate).toLocaleDateString():'—'}</td>
                          <td style={{ padding:'11px 14px', fontSize:'0.82em', whiteSpace:'nowrap' }}>{record.dueDate?new Date(record.dueDate).toLocaleDateString():'—'}</td>
                          <td style={{ padding:'11px 14px', fontSize:'0.82em', whiteSpace:'nowrap' }}>{record.returnDate?new Date(record.returnDate).toLocaleDateString():'—'}</td>
                          <td style={{ padding:'11px 14px' }}><StatusBadge record={record} /></td>
                          <td style={{ padding:'11px 14px' }}>
                            {isActive ? (
                              <button onClick={() => handleReturn(record.id)}
                                style={{ padding:'5px 14px', backgroundColor:COLORS.success, color:'white', border:'none', borderRadius:5, cursor:'pointer', fontWeight:700, fontSize:'0.85em' }}>
                                Return
                              </button>
                            ) : (
                              <span style={{ fontSize:'0.8em', color:COLORS.gray }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination page={returnPage} totalPages={totalReturnPages} onPageChange={setReturnPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}