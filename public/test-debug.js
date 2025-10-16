// Test script to debug upload issue
const testUpload = async () => {
    try {
        console.log('Testing admin projects endpoint...');
        const response = await fetch('/api/admin/projects');
        const result = await response.text();
        console.log('Response status:', response.status);
        console.log('Response body:', result);
        
        document.getElementById('output').innerHTML = `
            <h3>API Test Results</h3>
            <p>Status: ${response.status}</p>
            <pre>${result}</pre>
        `;
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('output').innerHTML = `<p>Error: ${error.message}</p>`;
    }
};

// Test upload without auth
const testDirectUpload = async () => {
    try {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        
        if (!file) {
            alert('Please select a file first');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'project-assets');
        formData.append('folder', 'thumbnails');
        
        console.log('Testing test-upload endpoint...');
        const response = await fetch('/api/test-upload', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        console.log('Upload response:', result);
        
        document.getElementById('uploadResult').innerHTML = `
            <h3>Upload Test Results</h3>
            <p>Status: ${response.status}</p>
            <pre>${JSON.stringify(result, null, 2)}</pre>
        `;
        
    } catch (error) {
        console.error('Upload error:', error);
        document.getElementById('uploadResult').innerHTML = `<p>Upload Error: ${error.message}</p>`;
    }
};

window.testUpload = testUpload;
window.testDirectUpload = testDirectUpload;