import { useState, useEffect } from 'react';
import { MetaPixelProvider, useMetaPixel } from '@adkit/meta-pixel-react';
import './App.css';

type TabType = 'dashboard' | 'manual' | 'events';

function App() {
    return (
        <MetaPixelProvider pixelIds={import.meta.env.VITE_META_PIXEL_ID || '1234567890'} debug={true} enableLocalhost={true} autoTrackPageView={true}>
            <AppContent />
        </MetaPixelProvider>
    );
}

function AppContent() {
    const [activeTab, setActiveTab] = useState<TabType>('dashboard');

    return (
        <div className="app">
            <header className="header">
                <h1>Meta Pixel React</h1>
                <p className="subtitle">Playground & Testing Suite</p>
            </header>

            <nav className="nav">
                <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    Dashboard
                </button>
                <button className={`nav-btn ${activeTab === 'manual' ? 'active' : ''}`} onClick={() => setActiveTab('manual')}>
                    Manual Tracking
                </button>
                <button className={`nav-btn ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>
                    All Events
                </button>
            </nav>

            <main className="content">
                {activeTab === 'dashboard' && <DashboardPage />}
                {activeTab === 'manual' && <ManualPage />}
                {activeTab === 'events' && <EventsPage />}
            </main>

            <footer className="footer">Check the browser console to verify Meta Pixel events.</footer>
        </div>
    );
}

// Dashboard Page - Status Overview
function DashboardPage() {
    const meta = useMetaPixel();
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(meta.isLoaded());
    }, [meta]);

    return (
        <div className="page">
            <div className="page-header">
                <h2>Status Dashboard</h2>
                <span className={`badge ${isLoaded ? 'badge-success' : 'badge-error'}`}>{isLoaded ? '✓ Pixel Loaded' : '✗ Pixel Not Loaded'}</span>
            </div>

            <div className="grid">
                <div className="card">
                    <h3>Configuration</h3>
                    <dl className="config-list">
                        <div className="config-item">
                            <dt>Pixel ID:</dt>
                            <dd className="mono">{import.meta.env.VITE_META_PIXEL_ID || '1234567890'}</dd>
                        </div>
                        <div className="config-item">
                            <dt>Auto Track PageView:</dt>
                            <dd className="text-success">Enabled</dd>
                        </div>
                        <div className="config-item">
                            <dt>Debug Mode:</dt>
                            <dd className="text-success">Enabled</dd>
                        </div>
                        <div className="config-item">
                            <dt>Localhost:</dt>
                            <dd className="text-success">Enabled</dd>
                        </div>
                    </dl>
                </div>

                <div className="card">
                    <h3>Current Status</h3>
                    <p>
                        This page <strong>should be tracked</strong>.
                    </p>
                    {isLoaded && (
                        <div className="alert alert-success">
                            <strong>Tracking Active</strong>
                            <p>PageView event should have been fired automatically.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Manual Tracking Page
function ManualPage() {
    const meta = useMetaPixel();
    const [logs, setLogs] = useState<{ time: string; message: string; type: string }[]>([]);

    const addLog = (message: string, type = 'info') => {
        setLogs((prev) =>
            [
                {
                    time: new Date().toLocaleTimeString(),
                    message,
                    type,
                },
                ...prev,
            ].slice(0, 20),
        );
    };

    const trackPurchase = () => {
        meta.track('Purchase', {
            value: 99.99,
            currency: 'USD',
            content_ids: ['SKU_123'],
            content_name: 'Premium Plan',
        });
        addLog('Tracked Purchase: $99.99', 'success');
    };

    const trackAddToCart = () => {
        meta.track('AddToCart', {
            value: 29.99,
            currency: 'USD',
            content_ids: ['SKU_456'],
        });
        addLog('Tracked AddToCart', 'info');
    };

    const trackLead = () => {
        meta.track('Lead', {
            content_name: 'Newsletter Signup',
        });
        addLog('Tracked Lead', 'info');
    };

    const trackCustom = () => {
        meta.trackCustom('ButtonClicked', {
            button_id: 'custom_btn_1',
        });
        addLog('Tracked Custom Event', 'warning');
    };

    const trackWithMetadata = () => {
        meta.track('ViewContent', { content_name: 'Test Page' }, { eventID: 'dedup-123' });
        addLog('Tracked with EventID: dedup-123', 'info');
    };

    return (
        <div className="page">
            <h2>Manual Tracking Tests</h2>

            <div className="grid grid-3">
                <div className="card">
                    <h3>Standard Events</h3>
                    <div className="button-stack">
                        <button className="btn btn-primary" onClick={trackPurchase}>
                            Track Purchase ($99)
                        </button>
                        <button className="btn btn-success" onClick={trackAddToCart}>
                            Track AddToCart
                        </button>
                        <button className="btn btn-info" onClick={trackLead}>
                            Track Lead
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3>Custom Events</h3>
                    <div className="button-stack">
                        <button className="btn btn-warning" onClick={trackCustom}>
                            Track Custom Event
                        </button>
                        <button className="btn btn-secondary" onClick={trackWithMetadata}>
                            With Metadata
                        </button>
                    </div>
                </div>

                <div className="card">
                    <h3>Status Log</h3>
                    <div className="log-container">
                        {logs.length === 0 ? (
                            <p className="log-empty">No events triggered yet</p>
                        ) : (
                            logs.map((log, i) => (
                                <div key={i} className={`log-item log-${log.type}`}>
                                    <span className="log-time">[{log.time}]</span>
                                    <span className="log-message">{log.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// All Events Page
function EventsPage() {
    const meta = useMetaPixel();
    const [trackedEvents, setTrackedEvents] = useState<string[]>([]);

    const events = [
        { name: 'ViewContent', label: 'View Content', data: { content_name: 'Product Page' } },
        { name: 'Search', label: 'Search', data: { search_string: 'test query' } },
        { name: 'AddToCart', label: 'Add to Cart', data: { value: 49.99, currency: 'USD' } },
        { name: 'AddToWishlist', label: 'Add to Wishlist', data: { content_ids: ['WISH_123'] } },
        { name: 'InitiateCheckout', label: 'Checkout', data: { value: 99.99, currency: 'USD' } },
        { name: 'Purchase', label: 'Purchase', data: { value: 149.99, currency: 'USD' } },
        { name: 'Lead', label: 'Lead', data: { content_name: 'Contact Form' } },
        { name: 'CompleteRegistration', label: 'Registration', data: { status: true } },
        { name: 'Contact', label: 'Contact', data: { content_name: 'Support' } },
        { name: 'Schedule', label: 'Schedule', data: { content_name: 'Demo Call' } },
    ];

    const trackEvent = (eventName: string, data: Record<string, unknown>) => {
        meta.track(eventName as 'ViewContent', data);
        setTrackedEvents((prev) => [...prev, eventName]);
    };

    return (
        <div className="page">
            <h2>Standard Events</h2>
            <p className="description">Click any button to fire that Meta Pixel event.</p>

            <div className="events-grid">
                {events.map((event) => (
                    <button key={event.name} className={`btn btn-event ${trackedEvents.includes(event.name) ? 'tracked' : ''}`} onClick={() => trackEvent(event.name, event.data)}>
                        {event.label}
                        {trackedEvents.filter((e) => e === event.name).length > 0 && <span className="event-count">({trackedEvents.filter((e) => e === event.name).length})</span>}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default App;
