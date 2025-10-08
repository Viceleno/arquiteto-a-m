
// This file can be used for any custom module declarations if needed in the future

declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';
  
  interface UserOptions {
    [key: string]: any;
  }
  
  function autoTable(doc: jsPDF, options: UserOptions): void;
  
  export default autoTable;
}
