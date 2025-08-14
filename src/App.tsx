          onXPUpdate={(newXP) => {
            // In a real implementation, you'd update the subject XP in the backend
            console.log('XP updated:', newXP);
          }}
        />
      )}
      
      <PWASettings
        isOpen={showPWASettings}
        onClose={() => setShowPWASettings(false)}
        onShowToast={showEnhancedToast}
      />
    </ErrorBoundary>
  );
}

export default App;