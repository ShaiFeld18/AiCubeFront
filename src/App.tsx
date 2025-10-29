import { useState } from 'react';
import { useFlow, LoadDataParams, FlowResponseBuilder, UserDescriptions } from './flow';
import { QueryList } from './components/QueryList';

function App() {
  const [receivedData, setReceivedData] = useState<LoadDataParams | null>(null);
  const [userDescriptions, setUserDescriptions] = useState<UserDescriptions>({});

  useFlow({
    onLoadData: (data: LoadDataParams) => {
      console.log('Received data from Flow:', data);
      setReceivedData(data);
      
      // Load user descriptions if they exist in the received data
      if (data.value.userDescriptions) {
        setUserDescriptions(data.value.userDescriptions);
      }
    },
    onSave: () => {
      console.log('Save triggered');
      
      // Build a response using the FlowResponseBuilder
      const builder = new FlowResponseBuilder();
      
      if (receivedData) {
        // Load the original data
        builder.loadFromObject(receivedData.value);
        
        // Modify or add some parameters
        builder.addParameter(
          'custom_param',
          'Custom Parameter',
          'String',
          'Modified by demo app',
          { IsRequired: false }
        );
      }
      
      const response = builder.build();
      
      // Add user descriptions to the response
      response.userDescriptions = userDescriptions;
      
      console.log('Sending response:', response);
      console.log('User descriptions:', userDescriptions);
      
      return response;
    },
    onCancel: () => {
      console.log('Cancel triggered');
    },
  });

  const handleUserDescriptionsChange = (descriptions: UserDescriptions) => {
    setUserDescriptions(descriptions);
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Connected Queries</h1>
      {receivedData ? (
        <QueryList 
          queries={receivedData.linkedQueries}
          initialUserDescriptions={userDescriptions}
          onUserDescriptionsChange={handleUserDescriptionsChange}
        />
      ) : (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginTop: '20px'
        }}>
          <p style={{ color: '#999' }}>Waiting for data from Flow parent window...</p>
        </div>
      )}
    </div>
  );
}

export default App;

