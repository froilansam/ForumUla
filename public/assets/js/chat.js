        if (event.keyCode == 13) {
            event.preventDefault();
            messageInput.value= "";
            appendMessage();
            messageFeed.scrollTop = messageFeed.scrollHeight;
            timedResponse();
        }        
        
    };
        
    document.addEventListener("keypress", logMessage, false);

    
}