"use client";

import { useState, ChangeEvent, SyntheticEvent } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Button,
  TextField,
  Typography,
  Alert,
  AlertColor,
  CircularProgress,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import MergeIcon from "@mui/icons-material/CallMerge";
import SplitscreenIcon from "@mui/icons-material/Splitscreen";
import ExtractIcon from "@mui/icons-material/Summarize";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function PDFOperations() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<AlertColor>("info");

  // Merge state
  const [mergeFiles, setMergeFiles] = useState<File[]>([]);
  const [mergeProgress, setMergeProgress] = useState(false);

  // Split state
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitType, setSplitType] = useState("range");
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [splitProgress, setSplitProgress] = useState(false);

  // Extract state
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [extractType, setExtractType] = useState("text");
  const [extractProgress, setExtractProgress] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Fill form state
  const [fillFile, setFillFile] = useState<File | null>(null);
  const [fillFields, setFillFields] = useState<
    { name: string; value: string }[]
  >([{ name: "", value: "" }]);
  const [fillProgress, setFillProgress] = useState(false);
  const [discoverProgress, setDiscoverProgress] = useState(false);
  const [discoveredFields, setDiscoveredFields] = useState<
    { name: string; type: string }[]
  >([]);
  const [discoverError, setDiscoverError] = useState("");

  const handleTabChange = (_: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setMessage("");
  };

  // Merge Functions
  const handleMergeFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMergeFiles([...mergeFiles, ...files]);
    setMessage("");
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles(mergeFiles.filter((_, i) => i !== index));
  };

  const handleMergePDFs = async () => {
    if (mergeFiles.length < 2) {
      setMessageType("error");
      setMessage("Please select at least 2 PDF files to merge");
      return;
    }

    setMergeProgress(true);
    setMessage("");

    try {
      const formData = new FormData();
      mergeFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/pdf/merge", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to merge PDFs");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessageType("success");
      setMessage(`Successfully merged ${mergeFiles.length} PDF files!`);
      setMergeFiles([]);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setMergeProgress(false);
    }
  };

  // Split Functions
  const handleSplitFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSplitFile(file);
      // Get total pages (we'll show this info)
      setMessage("File selected. Please enter page range.");
      setMessageType("info");
    }
  };

  const handleSplitPDF = async () => {
    if (!splitFile) {
      setMessageType("error");
      setMessage("Please select a PDF file to split");
      return;
    }

    const start = parseInt(startPage);
    if (isNaN(start) || start < 1) {
      setMessageType("error");
      setMessage("Please enter a valid start page (minimum 1)");
      return;
    }

    if (splitType === "range") {
      const end = parseInt(endPage);
      if (isNaN(end) || end < start) {
        setMessageType("error");
        setMessage("Please enter a valid end page (must be >= start page)");
        return;
      }
    }

    setSplitProgress(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", splitFile);
      formData.append("startPage", startPage);
      formData.append("endPage", endPage || "0");
      formData.append("splitType", splitType);

      const response = await fetch("/api/pdf/split", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to split PDF");
      }

      if (splitType === "individual") {
        // Handle individual pages - JSON response
        const data = await response.json();
        if (data.pages && data.pages.length > 0) {
          // Download each page as a separate PDF
          for (const page of data.pages) {
            const binaryString = atob(page.data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `page_${page.pageNum}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            // Add delay between downloads to prevent browser blocking
            await new Promise((resolve) => setTimeout(resolve, 100));
          }

          setMessageType("success");
          setMessage(
            `Successfully split PDF into ${data.totalPages} individual pages! Check your downloads folder.`,
          );
        }
      } else {
        // Handle page range - PDF response
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `pages_${startPage}_to_${endPage || "end"}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        setMessageType("success");
        setMessage(
          `Successfully extracted pages ${startPage} to ${endPage || "end"}!`,
        );
      }

      setSplitFile(null);
      setStartPage("1");
      setEndPage("");
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setSplitProgress(false);
    }
  };

  // Extract Functions
  const handleExtractFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExtractFile(file);
      setMessage("File selected. Choose extraction type and click Extract.");
      setMessageType("info");
      setExtractedData(null);
    }
  };

  const handleExtractData = async () => {
    if (!extractFile) {
      setMessageType("error");
      setMessage("Please select a PDF file");
      return;
    }

    setExtractProgress(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", extractFile);
      formData.append("extractType", extractType);

      const response = await fetch("/api/pdf/extract-data", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to extract data";
        try {
          const error = await response.clone().json();
          errorMessage = error.error || errorMessage;
        } catch {
          try {
            const rawText = await response.text();
            errorMessage = rawText.includes("<!DOCTYPE html>")
              ? `HTTP ${response.status}: ${response.statusText}`
              : rawText;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setExtractedData(data);
      setMessageType("success");

      if (extractType === "text") {
        setMessage("Successfully extracted text from PDF!");
      } else if (extractType === "metadata") {
        setMessage("Successfully extracted metadata from PDF!");
      } else if (extractType === "pages") {
        setMessage(
          `Successfully extracted text from ${data.totalPages} pages!`,
        );
      }
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setExtractProgress(false);
    }
  };

  const downloadExtractedData = () => {
    if (!extractedData) return;

    const dataStr = JSON.stringify(extractedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = window.URL.createObjectURL(dataBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_${extractType}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleFillFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFillFile(file);
      setDiscoveredFields([]);
      setDiscoverError("");
      setMessage("PDF selected for form filling. Add field names and values.");
      setMessageType("info");
    }
  };

  const handleDiscoverFieldNames = async () => {
    if (!fillFile) {
      setDiscoverError("Please select a PDF file first.");
      return;
    }

    setDiscoverProgress(true);
    setDiscoverError("");
    setDiscoveredFields([]);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", fillFile);

      const response = await fetch("/api/pdf/form-fields", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to discover field names");
      }

      const data = await response.json();
      setDiscoveredFields(data.fields || []);
      setMessageType("success");
      setMessage(`Found ${data.fields?.length ?? 0} form field(s).`);
    } catch (error) {
      setDiscoverError(
        error instanceof Error ? error.message : "An error occurred",
      );
    } finally {
      setDiscoverProgress(false);
    }
  };

  const useDiscoveredFields = () => {
    if (discoveredFields.length === 0) return;
    setFillFields(
      discoveredFields.map((field) => ({ name: field.name, value: "" })),
    );
  };

  const addFillField = () => {
    setFillFields([...fillFields, { name: "", value: "" }]);
  };

  const removeFillField = (index: number) => {
    setFillFields(fillFields.filter((_, i) => i !== index));
  };

  const updateFillField = (
    index: number,
    field: "name" | "value",
    value: string,
  ) => {
    const updatedFields = [...fillFields];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFillFields(updatedFields);
  };

  const handleFillForm = async () => {
    if (!fillFile) {
      setMessageType("error");
      setMessage("Please select a PDF file to fill");
      return;
    }

    const validFields = fillFields.filter((item) => item.name.trim());
    if (validFields.length === 0) {
      setMessageType("error");
      setMessage("Add at least one form field name and value.");
      return;
    }

    setFillProgress(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", fillFile);
      formData.append("fields", JSON.stringify(validFields));

      const response = await fetch("/api/pdf/fill-form", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fill PDF form");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "filled-form.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMessageType("success");
      setMessage("PDF form filled successfully! Download started.");
      setFillFile(null);
      setFillFields([{ name: "", value: "" }]);
    } catch (error) {
      setMessageType("error");
      setMessage(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setFillProgress(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: "bold" }}>
          📄 PDF Operations Demo
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Merge, split, extract data, or fill PDF forms
        </Typography>
      </Box>
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        aria-label="pdf operations"
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Merge PDFs"
          id="tab-0"
          aria-controls="tabpanel-0"
          icon={<MergeIcon />}
          iconPosition="start"
        />
        <Tab
          label="Split PDF"
          id="tab-1"
          aria-controls="tabpanel-1"
          icon={<SplitscreenIcon />}
          iconPosition="start"
        />
        <Tab
          label="Extract Data"
          id="tab-2"
          aria-controls="tabpanel-2"
          icon={<ExtractIcon />}
          iconPosition="start"
        />
        <Tab
          label="Fill Form"
          id="tab-3"
          aria-controls="tabpanel-3"
          icon={<EditIcon />}
          iconPosition="start"
        />
      </Tabs>
      {/* Merge PDFs Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardHeader title="Select Files to Merge" />
              <CardContent>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  component="label"
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#1976d2", mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to select PDF files
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    or drag and drop
                  </Typography>
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleMergeFileSelect}
                    hidden
                  />
                </Box>

                {message && (
                  <Alert severity={messageType} sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: "bold", mb: 2 }}
                  >
                    Selected Files ({mergeFiles.length})
                  </Typography>
                  {mergeFiles.length === 0 ? (
                    <Typography variant="body2" color="textSecondary">
                      No files selected yet
                    </Typography>
                  ) : (
                    <List>
                      {mergeFiles.map((file, index) => (
                        <ListItem
                          key={index}
                          secondaryAction={
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => removeMergeFile(index)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          }
                        >
                          <ListItemText
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 3 }}
                  onClick={handleMergePDFs}
                  disabled={mergeFiles.length < 2 || mergeProgress}
                  startIcon={
                    mergeProgress ? (
                      <CircularProgress size={20} />
                    ) : (
                      <MergeIcon />
                    )
                  }
                >
                  {mergeProgress ? "Merging..." : "Merge PDFs"}
                </Button>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
              <CardHeader title="How to Merge" />
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Steps:</strong>
                </Typography>
                <ol style={{ paddingLeft: "20px" }}>
                  <li>
                    <Typography variant="body2">
                      Select 2 or more PDF files using the upload area
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Files will be merged in the order they appear
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Merge PDFs" to combine all files into one
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Download the merged PDF file automatically
                    </Typography>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
      {/* Split PDF Tab */}
      <TabPanel value={tabValue} index={1}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardHeader title="Select File to Split" />
              <CardContent>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  component="label"
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#1976d2", mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to select a PDF file
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    or drag and drop
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleSplitFileSelect}
                    hidden
                  />
                </Box>

                {message && (
                  <Alert severity={messageType} sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                {splitFile && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 3, fontWeight: "bold" }}
                    >
                      File Selected
                    </Typography>
                    <ListItem>
                      <ListItemText
                        primary={splitFile!.name}
                        secondary={`${(splitFile!.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>

                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Split Options
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Button
                        variant={
                          splitType === "range" ? "contained" : "outlined"
                        }
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => setSplitType("range")}
                      >
                        Extract Page Range
                      </Button>
                      <Button
                        variant={
                          splitType === "individual" ? "contained" : "outlined"
                        }
                        fullWidth
                        onClick={() => setSplitType("individual")}
                      >
                        Split into Individual Pages
                      </Button>
                    </Box>

                    {splitType === "range" && (
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          label="Start Page"
                          type="number"
                          value={startPage}
                          onChange={(e) => setStartPage(e.target.value)}
                          fullWidth
                          sx={{ mb: 2 }}
                          inputProps={{ min: 1 }}
                        />
                        <TextField
                          label="End Page (leave empty for last page)"
                          type="number"
                          value={endPage}
                          onChange={(e) => setEndPage(e.target.value)}
                          fullWidth
                          inputProps={{ min: 1 }}
                        />
                      </Box>
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={handleSplitPDF}
                      disabled={!splitFile || splitProgress}
                      startIcon={
                        splitProgress ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SplitscreenIcon />
                        )
                      }
                    >
                      {splitProgress ? "Processing..." : "Split PDF"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
              <CardHeader title="How to Split" />
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Option 1: Extract Page Range
                </Typography>
                <ol style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                  <li>
                    <Typography variant="body2">
                      Select a PDF file using the upload area
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Extract Page Range"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Enter start page and end page numbers
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Split PDF" to extract pages
                    </Typography>
                  </li>
                </ol>

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Option 2: Split to Individual Pages
                </Typography>
                <ol style={{ paddingLeft: "20px" }}>
                  <li>
                    <Typography variant="body2">Select a PDF file</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Split into Individual Pages"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Split PDF" to extract all pages
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Each page will be downloaded as a separate PDF file
                    </Typography>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
      {/* Extract Data Tab */}
      <TabPanel value={tabValue} index={2}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardHeader title="Select PDF to Extract Data" />
              <CardContent>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  component="label"
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#1976d2", mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to select a PDF file
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    or drag and drop
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleExtractFileSelect}
                    hidden
                  />
                </Box>

                {message && (
                  <Alert severity={messageType} sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                {extractFile && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 3, fontWeight: "bold" }}
                    >
                      File Selected
                    </Typography>
                    <ListItem>
                      <ListItemText
                        primary={extractFile.name}
                        secondary={`${(extractFile.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>

                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Extract Type
                    </Typography>

                    <Box sx={{ mt: 2, mb: 2 }}>
                      <Button
                        variant={
                          extractType === "text" ? "contained" : "outlined"
                        }
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => setExtractType("text")}
                      >
                        Extract All Text
                      </Button>
                      <Button
                        variant={
                          extractType === "metadata" ? "contained" : "outlined"
                        }
                        fullWidth
                        sx={{ mb: 1 }}
                        onClick={() => setExtractType("metadata")}
                      >
                        Extract Metadata
                      </Button>
                      <Button
                        variant={
                          extractType === "pages" ? "contained" : "outlined"
                        }
                        fullWidth
                        onClick={() => setExtractType("pages")}
                      >
                        Extract Text by Page
                      </Button>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={handleExtractData}
                      disabled={!extractFile || extractProgress}
                      startIcon={
                        extractProgress ? (
                          <CircularProgress size={20} />
                        ) : (
                          <ExtractIcon />
                        )
                      }
                    >
                      {extractProgress ? "Extracting..." : "Extract Data"}
                    </Button>

                    {extractedData && (
                      <Button
                        variant="outlined"
                        fullWidth
                        sx={{ mt: 2 }}
                        startIcon={<DownloadIcon />}
                        onClick={downloadExtractedData}
                      >
                        Download as JSON
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
              <CardHeader title="How to Extract Data" />
              <CardContent>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Extract All Text
                </Typography>
                <ol style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                  <li>
                    <Typography variant="body2">Select a PDF file</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Choose "Extract All Text"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Download the extracted content as JSON
                    </Typography>
                  </li>
                </ol>

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Extract Metadata
                </Typography>
                <ol style={{ paddingLeft: "20px", marginBottom: "20px" }}>
                  <li>
                    <Typography variant="body2">Select a PDF file</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Choose "Extract Metadata"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Download metadata as JSON
                    </Typography>
                  </li>
                </ol>

                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Extract Text by Page
                </Typography>
                <ol style={{ paddingLeft: "20px" }}>
                  <li>
                    <Typography variant="body2">Select a PDF file</Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Choose "Extract Text by Page"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Download page-level text as JSON
                    </Typography>
                  </li>
                </ol>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>
      {/* Fill Form Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
          }}
        >
          <Box>
            <Card>
              <CardHeader title="Select PDF to Fill" />
              <CardContent>
                <Box
                  sx={{
                    border: "2px dashed #1976d2",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: "#f5f5f5",
                    },
                  }}
                  component="label"
                >
                  <CloudUploadIcon
                    sx={{ fontSize: 48, color: "#1976d2", mb: 1 }}
                  />
                  <Typography variant="body1" sx={{ mb: 1 }}>
                    Click to select a PDF file
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    or drag and drop
                  </Typography>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFillFileSelect}
                    hidden
                  />
                </Box>

                {message && (
                  <Alert severity={messageType} sx={{ mt: 2 }}>
                    {message}
                  </Alert>
                )}

                {fillFile && (
                  <>
                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 3, fontWeight: "bold" }}
                    >
                      File Selected
                    </Typography>
                    <ListItem>
                      <ListItemText
                        primary={fillFile.name}
                        secondary={`${(fillFile.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2, mb: 2 }}
                      onClick={handleDiscoverFieldNames}
                      disabled={discoverProgress}
                    >
                      {discoverProgress
                        ? "Discovering fields..."
                        : "Discover Field Names"}
                    </Button>

                    {discoverError && (
                      <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                        {discoverError}
                      </Alert>
                    )}

                    {discoveredFields.length > 0 && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: "bold" }}
                        >
                          Discovered Fields
                        </Typography>
                        <List>
                          {discoveredFields.map((field, index) => (
                            <ListItem key={index} disablePadding>
                              <ListItemText
                                primary={field.name}
                                secondary={field.type}
                              />
                            </ListItem>
                          ))}
                        </List>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={useDiscoveredFields}
                        >
                          Load Discovered Fields
                        </Button>
                      </Box>
                    )}

                    <Typography
                      variant="subtitle2"
                      sx={{ mt: 2, fontWeight: "bold" }}
                    >
                      Form Fields
                    </Typography>

                    {fillFields.map((field, index) => (
                      <Box key={index} sx={{ mt: 2, display: "grid", gap: 2 }}>
                        <TextField
                          label="Field Name"
                          value={field.name}
                          onChange={(e) =>
                            updateFillField(index, "name", e.target.value)
                          }
                          fullWidth
                        />
                        <TextField
                          label="Value"
                          value={field.value}
                          onChange={(e) =>
                            updateFillField(index, "value", e.target.value)
                          }
                          fullWidth
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => removeFillField(index)}
                        >
                          Remove Field
                        </Button>
                      </Box>
                    ))}

                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={addFillField}
                    >
                      Add Field
                    </Button>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ mt: 3 }}
                      onClick={handleFillForm}
                      disabled={!fillFile || fillProgress}
                      startIcon={
                        fillProgress ? (
                          <CircularProgress size={20} />
                        ) : (
                          <EditIcon />
                        )
                      }
                    >
                      {fillProgress ? "Filling Form..." : "Fill PDF Form"}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ backgroundColor: "#f5f5f5" }}>
              <CardHeader title="How to Fill PDF Forms" />
              <CardContent>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Need a test PDF?</strong>
                </Typography>
                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  sx={{ mb: 3 }}
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = "/api/pdf/sample-form";
                    link.download = "sample-fillable-form.pdf";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  startIcon={<CloudDownloadIcon />}
                >
                  Download Sample Fillable PDF
                </Button>

                <Typography variant="body2" sx={{ mb: 2 }}>
                  <strong>Steps:</strong>
                </Typography>
                <ol style={{ paddingLeft: "20px" }}>
                  <li>
                    <Typography variant="body2">
                      Select a PDF file containing form fields
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Add each field name and its replacement value
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Click "Fill PDF Form" to generate a filled file
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2">
                      Download the filled PDF after processing
                    </Typography>
                  </li>
                </ol>

                <Typography variant="body2" sx={{ mt: 2, fontWeight: "bold" }}>
                  Sample Field Names:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "0.8rem", color: "text.secondary" }}
                >
                  name, email, phone, address, agree, gender, country
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </TabPanel>{" "}
    </div>
  );
}
