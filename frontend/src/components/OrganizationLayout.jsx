import OrganizationSidebar from './OrganizationSidebar';

export default function OrganizationLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8F2FE' }}>
      <OrganizationSidebar />
      <div style={{ 
        marginLeft: 280, 
        flex: 1,
        minHeight: '100vh'
      }}>
        {children}
      </div>
    </div>
  );
}
