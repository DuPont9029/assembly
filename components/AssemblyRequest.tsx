"use client";

import { useState, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import { Save, FileText, PenLine, Download, PenTool } from "lucide-react";
import { ethers } from "ethers";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Logo } from "./Logo";

export default function AssemblyRequest() {
  const { address } = useWallet();
  const [isEditing, setIsEditing] = useState(true);
  const [signature, setSignature] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    representativeName: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "08:00",
    endTime: "10:00",
    location: "Aula Magna",
    mandatoryAttendance: false,
    agenda:
      "1. Discussione problemi scolastici\n2. Proposte attività extrascolastiche\n3. Varie ed eventuali",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Reset signature when data changes to ensure signature matches content
    if (signature) setSignature(null);
  };

  const handleSign = async () => {
    try {
      if (typeof window.ethereum === "undefined") {
        alert("MetaMask non installato");
        return null;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const message = `RICHIESTA ASSEMBLEA DI ISTITUTO
      
Rappresentante: ${formData.representativeName}
Data: ${formData.date}
Orario: ${formData.startTime} - ${formData.endTime}
Luogo: ${formData.location}${
        formData.mandatoryAttendance
          ? " alla quale dovranno obbligatoriamente partecipare tutti i rappresentanti degli studenti"
          : ""
      }
Ordine del Giorno:
${formData.agenda}`;

      const sig = await signer.signMessage(message);
      setSignature(sig);
      return sig;
    } catch (error) {
      console.error("Error signing message:", error);
      alert("Errore durante la firma del documento");
      return null;
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`Richiesta_Assemblea_${formData.date}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Errore durante la generazione del PDF");
    }
  };

  const handleSave = async () => {
    // If editing, switch to preview first
    if (isEditing) {
      setIsEditing(false);
      // Wait for render to complete before proceeding
      setTimeout(async () => {
        if (!signature) {
          const sig = await handleSign();
          if (sig) {
            // Need another timeout to let the signature render
            setTimeout(handleDownloadPDF, 500);
          }
        } else {
          handleDownloadPDF();
        }
      }, 100);
    } else {
      if (!signature) {
        const sig = await handleSign();
        if (sig) {
          setTimeout(handleDownloadPDF, 500);
        }
      } else {
        handleDownloadPDF();
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Richiesta Assemblea
          </h2>
          <p className="text-gray-500 text-sm">
            Compila il modulo per generare la richiesta ufficiale.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
              isEditing
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {isEditing ? (
              <FileText className="w-4 h-4" />
            ) : (
              <PenLine className="w-4 h-4" />
            )}
            {isEditing ? "Anteprima" : "Modifica"}
          </button>
        </div>
      </div>

      {isEditing ? (
        <form className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Rappresentante
              </label>
              <input
                type="text"
                name="representativeName"
                value={formData.representativeName}
                onChange={handleChange}
                placeholder="Mario Rossi"
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Luogo
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
              />
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="mandatoryAttendance"
                  name="mandatoryAttendance"
                  checked={formData.mandatoryAttendance}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="mandatoryAttendance"
                  className="text-sm text-gray-600 select-none cursor-pointer"
                >
                  Obbligo presenza rappresentanti
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Inizio
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ora Fine
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordine del Giorno
            </label>
            <textarea
              name="agenda"
              value={formData.agenda}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  const textarea = e.currentTarget;
                  const { selectionStart, selectionEnd, value } = textarea;
                  const textBefore = value.substring(0, selectionStart);
                  const textAfter = value.substring(selectionEnd);

                  const matches = textBefore.match(/(?:^|\n)(\d+)\.\s/g);
                  let insertion = "\n";

                  if (matches && matches.length > 0) {
                    const lastMatch = matches[matches.length - 1];
                    const numberMatch = lastMatch.match(/(\d+)/);
                    if (numberMatch) {
                      const nextNum = parseInt(numberMatch[1], 10) + 1;
                      insertion = `\n${nextNum}. `;
                    }
                  }

                  const newValue = textBefore + insertion + textAfter;
                  setFormData((prev) => ({ ...prev, agenda: newValue }));

                  setTimeout(() => {
                    textarea.selectionStart = selectionStart + insertion.length;
                    textarea.selectionEnd = selectionStart + insertion.length;
                  }, 0);
                }
              }}
              rows={6}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-black"
              placeholder="Inserisci i punti dell'ordine del giorno..."
            />
          </div>
        </form>
      ) : (
        <div
          ref={previewRef}
          className="p-8 rounded-xl border font-serif"
          style={{
            backgroundColor: "#ffffff",
            borderColor: "#e5e7eb",
            color: "#000000",
          }}
        >
          <div className="max-w-2xl mx-auto space-y-6">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "2rem",
              }}
            >
              <Logo style={{ width: "100px", height: "auto" }} />
              <div className="text-right">
                <p>Alla Dirigenza Scolastica</p>
              </div>
            </div>

            <div className="space-y-1">
              <p>
                <span className="font-bold">Oggetto:</span> Richiesta Assemblea
                di Istituto
              </p>
            </div>

            <div className="space-y-4 leading-relaxed">
              <p style={{ color: "#000000" }}>
                Il sottoscritto Rappresentante degli Studenti{" "}
                <strong>
                  {formData.representativeName || "[Nome Cognome]"}
                </strong>
                ,{" "}
                {signature ? (
                  <span className="font-medium" style={{ color: "#15803d" }}>
                    con firma digitale{" "}
                    <span
                      className="font-mono text-xs p-1 rounded border"
                      style={{
                        backgroundColor: "#f0fdf4",
                        borderColor: "#bbf7d0",
                        overflowWrap: "anywhere",
                        wordBreak: "break-all",
                        display: "inline-block",
                        marginLeft: "8px",
                        marginTop: "8px",
                      }}
                    >
                      {signature}
                    </span>
                  </span>
                ) : (
                  <button
                    onClick={handleSign}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium transition-colors mx-1 align-middle"
                    style={{
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                    }}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    Firma con MetaMask
                  </button>
                )}
              </p>
              <p>CHIEDE A NOME DEL COMITATO STUDENTESCO</p>
              <p>
                di poter effettuare un'assemblea di istituto il giorno{" "}
                <strong>
                  {new Date(formData.date).toLocaleDateString("it-IT")}
                </strong>{" "}
                dalle ore <strong>{formData.startTime}</strong> alle ore{" "}
                <strong>{formData.endTime}</strong> presso{" "}
                <strong>{formData.location}</strong>
                {formData.mandatoryAttendance && (
                  <span>
                    {" "}
                    alla quale dovranno obbligatoriamente partecipare tutti i
                    rappresentanti degli studenti
                  </span>
                )}
                .
              </p>
              <p>L'assemblea avrà il seguente Ordine del Giorno:</p>
              <div
                className="pl-4 border-l-2 whitespace-pre-line"
                style={{ borderColor: "#d1d5db" }}
              >
                {formData.agenda}
              </div>
            </div>

            <div className="mt-12 flex justify-end">
              <div className="text-center">
                <p>Il Rappresentante</p>
                <div className="h-12"></div>
                <p className="border-t pt-1" style={{ borderColor: "#9ca3af" }}>
                  {formData.representativeName || "Firma"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
        <button
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
          onClick={handleSave}
        >
          <Save className="w-4 h-4" />
          {signature ? "Scarica PDF" : "Firma e Salva"}
        </button>
      </div>
    </div>
  );
}
