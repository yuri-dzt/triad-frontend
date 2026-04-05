import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, BookOpenIcon, XIcon } from 'lucide-react';
import { z } from 'zod';
import { Book } from '../../types';
import { cn } from '../../lib/utils';
import { disciplineApi } from '../../lib/api';
const bookSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  author: z.string().min(1, 'Autor é obrigatório'),
  totalPages: z.number().min(1, 'Total de páginas deve ser maior que 0')
});
const readingLogSchema = z.object({
  date: z.string().min(1, 'Data é obrigatória'),
  fromPage: z.number().min(0, 'Página inicial inválida'),
  toPage: z.number().min(1, 'Página final inválida')
});
export function BooksPage() {
  const [books, setBooks] = useState<
    (Book & {
      pagesRead: number;
    })[]>(
    []);
  const [isLoading, setIsLoading] = useState(true);
  // Modals state
  const [showBookModal, setShowBookModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<
    (Book & {
      pagesRead: number;
    }) |
    null>(
    null);
  // Forms state
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    totalPages: 100
  });
  const [logForm, setLogForm] = useState({
    date: new Date().toISOString().split('T')[0],
    fromPage: 0,
    toPage: 0
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => {
    fetchBooks();
  }, []);
  const fetchBooks = async () => {
    setIsLoading(true);
    try {
      const booksData = await disciplineApi.getBooks();
      const booksWithProgress = await Promise.all(
        (booksData || []).map(async (book: Book) => {
          const progress = await disciplineApi.getBookProgress(book.id).catch(() => ({ pagesRead: 0 }));
          return { ...book, pagesRead: progress?.pagesRead || 0 };
        })
      );
      setBooks(booksWithProgress);
    } catch (error) {
      console.error('Erro ao carregar livros:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };
  const handleOpenBookModal = () => {
    setBookForm({
      title: '',
      author: '',
      totalPages: 100
    });
    setErrors({});
    setShowBookModal(true);
  };
  const handleOpenLogModal = (
  book: Book & {
    pagesRead: number;
  }) =>
  {
    setSelectedBook(book);
    setLogForm({
      date: new Date().toISOString().split('T')[0],
      fromPage: book.pagesRead,
      toPage: book.pagesRead
    });
    setErrors({});
    setShowLogModal(true);
  };
  const handleSaveBook = async () => {
    try {
      const validData = bookSchema.parse(bookForm);
      try {
        await disciplineApi.createBook(validData);
        setShowBookModal(false);
        fetchBooks();
      } catch (apiError) {
        console.error('Erro ao salvar livro:', apiError);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };
  const handleSaveLog = async () => {
    try {
      const data = readingLogSchema.parse(logForm);
      if (data.toPage <= data.fromPage) {
        setErrors({
          toPage: 'Página final deve ser maior que a inicial'
        });
        return;
      }
      if (selectedBook && data.toPage > selectedBook.totalPages) {
        setErrors({
          toPage: 'Não pode exceder o total de páginas do livro'
        });
        return;
      }
      try {
        await disciplineApi.createReadingLog({
          bookId: selectedBook!.id,
          date: new Date(data.date).getTime(),
          pagesRead: data.toPage - data.fromPage,
          fromPage: data.fromPage,
          toPage: data.toPage
        });
        setShowLogModal(false);
        fetchBooks();
      } catch (apiError) {
        console.error('Erro ao registrar leitura:', apiError);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0].toString()] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 bg-secondary rounded-md"></div>
          <div className="h-10 w-32 bg-secondary rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) =>
          <div
            key={i}
            className="h-48 bg-card rounded-xl border border-border">
          </div>
          )}
        </div>
      </div>);

  }
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Livros
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe suas leituras e registre seu progresso.
          </p>
        </div>
        <button
          onClick={handleOpenBookModal}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors font-medium">
          
          <PlusIcon size={18} />
          Novo Livro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => {
          const progressPercent = Math.min(
            100,
            Math.round(book.pagesRead / book.totalPages * 100)
          );
          return (
            <div
              key={book.id}
              className="bg-card border border-border rounded-xl p-6 flex flex-col">
              
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1 min-w-0 pr-4">
                  <h3
                    className="font-medium text-lg truncate"
                    title={book.title}>
                    
                    {book.title}
                  </h3>
                  <p className="text-sm text-muted-foreground truncate">
                    {book.author}
                  </p>
                </div>
                {!book.isActive ?
                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                    Concluído
                  </span> :

                <span className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                    Lendo
                  </span>
                }
              </div>

              <div className="mt-auto space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-medium">
                      {book.pagesRead} / {book.totalPages} pág. (
                      {progressPercent}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        !book.isActive ?
                        'bg-primary' :
                        'bg-blue-500'
                      )}
                      style={{
                        width: `${progressPercent}%`
                      }} />
                    
                  </div>
                </div>

                {book.isActive &&
                <button
                  onClick={() => handleOpenLogModal(book)}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors text-sm font-medium">
                  
                    <BookOpenIcon size={16} />
                    Registrar Leitura
                  </button>
                }
              </div>
            </div>);

        })}
      </div>

      {/* Create Book Modal */}
      <AnimatePresence>
        {showBookModal &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowBookModal(false)} />
          
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Novo Livro</h2>
                <button
                onClick={() => setShowBookModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <input
                  type="text"
                  value={bookForm.title}
                  onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    title: e.target.value
                  })
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                
                  {errors.title &&
                <p className="text-xs text-destructive">{errors.title}</p>
                }
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Autor</label>
                  <input
                  type="text"
                  value={bookForm.author}
                  onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    author: e.target.value
                  })
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                
                  {errors.author &&
                <p className="text-xs text-destructive">{errors.author}</p>
                }
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Total de Páginas
                  </label>
                  <input
                  type="number"
                  min="1"
                  value={bookForm.totalPages}
                  onChange={(e) =>
                  setBookForm({
                    ...bookForm,
                    totalPages: Number(e.target.value)
                  })
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                
                  {errors.totalPages &&
                <p className="text-xs text-destructive">
                      {errors.totalPages}
                    </p>
                }
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/20">
                <button
                onClick={() => setShowBookModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                
                  Cancelar
                </button>
                <button
                onClick={handleSaveBook}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>

      {/* Log Reading Modal */}
      <AnimatePresence>
        {showLogModal && selectedBook &&
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowLogModal(false)} />
          
            <motion.div
            initial={{
              opacity: 0,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              scale: 1
            }}
            exit={{
              opacity: 0,
              scale: 0.95
            }}
            className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Registrar Leitura</h2>
                <button
                onClick={() => setShowLogModal(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors">
                
                  <XIcon size={20} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div className="p-3 bg-secondary/50 rounded-lg border border-border text-sm">
                  <p className="font-medium">{selectedBook.title}</p>
                  <p className="text-muted-foreground mt-1">
                    Progresso atual: {selectedBook.pagesRead} de{' '}
                    {selectedBook.totalPages} páginas
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data</label>
                  <input
                  type="date"
                  value={logForm.date}
                  onChange={(e) =>
                  setLogForm({
                    ...logForm,
                    date: e.target.value
                  })
                  }
                  className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                
                  {errors.date &&
                <p className="text-xs text-destructive">{errors.date}</p>
                }
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Da página</label>
                    <input
                    type="number"
                    min="0"
                    value={logForm.fromPage}
                    onChange={(e) =>
                    setLogForm({
                      ...logForm,
                      fromPage: Number(e.target.value)
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                  
                    {errors.fromPage &&
                  <p className="text-xs text-destructive">
                        {errors.fromPage}
                      </p>
                  }
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Até a página</label>
                    <input
                    type="number"
                    min={logForm.fromPage + 1}
                    max={selectedBook.totalPages}
                    value={logForm.toPage}
                    onChange={(e) =>
                    setLogForm({
                      ...logForm,
                      toPage: Number(e.target.value)
                    })
                    }
                    className="w-full px-3 py-2 bg-input border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary" />
                  
                    {errors.toPage &&
                  <p className="text-xs text-destructive">
                        {errors.toPage}
                      </p>
                  }
                  </div>
                </div>

                {logForm.toPage > logForm.fromPage &&
              <p className="text-sm text-primary font-medium text-center pt-2">
                    +{logForm.toPage - logForm.fromPage} páginas lidas
                  </p>
              }
              </div>

              <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/20">
                <button
                onClick={() => setShowLogModal(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                
                  Cancelar
                </button>
                <button
                onClick={handleSaveLog}
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                
                  Salvar
                </button>
              </div>
            </motion.div>
          </div>
        }
      </AnimatePresence>
    </div>);

}