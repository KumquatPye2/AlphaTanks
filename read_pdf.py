import PyPDF2
import pdfplumber

def read_pdf_with_pypdf2(file_path):
    """Read PDF using PyPDF2"""
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
    return text

def read_pdf_with_pdfplumber(file_path):
    """Read PDF using pdfplumber (better for complex layouts)"""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

if __name__ == "__main__":
    pdf_path = "2507.18074v1.pdf"
    
    print("Reading PDF with pdfplumber...")
    try:
        content = read_pdf_with_pdfplumber(pdf_path)
        print(f"Successfully extracted {len(content)} characters")
        
        # Save to text file for easier reading
        with open("asi_arch_paper.txt", "w", encoding="utf-8") as f:
            f.write(content)
        print("Content saved to asi_arch_paper.txt")
        
        # Print first 2000 characters as preview
        print("\n--- PREVIEW (first 2000 chars) ---")
        print(content[:2000])
        
    except Exception as e:
        print(f"Error with pdfplumber: {e}")
        print("Trying PyPDF2...")
        try:
            content = read_pdf_with_pypdf2(pdf_path)
            print(f"Successfully extracted {len(content)} characters with PyPDF2")
            with open("asi_arch_paper.txt", "w", encoding="utf-8") as f:
                f.write(content)
        except Exception as e2:
            print(f"Error with PyPDF2: {e2}")
