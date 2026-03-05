import { useEffect, useState } from 'react';
import { Fingerprint, PlugZap } from 'lucide-react';
import { sha256 } from '../utils/sha256';

export default function HardwareFingerprintCapture({ onHash }) {
  const [supported, setSupported] = useState(true);
  const [port, setPort] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState('Not connected');
  const [mode, setMode] = useState('Register'); // or 'Voting'
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!('serial' in navigator)) {
      setSupported(false);
    }
  }, []);

  const connect = async () => {
    try {
      setConnecting(true);
      setStatus('Requesting serial device...');
      const selectedPort = await navigator.serial.requestPort();
      await selectedPort.open({ baudRate: 9600 });
      setPort(selectedPort);
      setStatus('Connected to fingerprint device');
      readLoop(selectedPort);
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect to device');
    } finally {
      setConnecting(false);
    }
  };

  const readLoop = async (serialPort) => {
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    const reader = textDecoder.readable.getReader();

    let buffer = '';

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { value, done: readerDone } = await reader.read();
        if (readerDone) break;
        buffer += value;
        let newlineIndex;
        // process line by line
        while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          if (!line) continue;
          handleLineFromDevice(line);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      reader.releaseLock();
      await readableStreamClosed.catch(() => {});
    }
  };

  const handleLineFromDevice = async (line) => {
    console.log('FP device:', line);
    // Example lines: "FPID_23"
    if (line.startsWith('FPID_')) {
      setStatus(`Fingerprint captured from device (${line})`);
      const hash = await sha256(line);
      onHash?.(hash);
      setDone(true);
    }
  };

  const sendCommand = async (command) => {
    if (!port) {
      setStatus('Connect device first');
      return;
    }
    try {
      const textEncoder = new TextEncoder();
      const writer = port.writable.getWriter();
      await writer.write(textEncoder.encode(`${command}\n`));
      writer.releaseLock();
      setStatus(`Sent "${command}" to device. Follow sensor instructions.`);
    } catch (err) {
      console.error(err);
      setStatus('Failed to send command to device');
    }
  };

  if (!supported) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
        Your browser does not support the Web Serial API. Please use a recent version of Chrome or
        Edge to connect the fingerprint sensor, or enter the fingerprint ID manually.
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
        <Fingerprint className="w-10 h-10 text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-800">Fingerprint captured from hardware</p>
          <p className="text-sm text-emerald-600">
            Device ID was hashed and stored securely for this voter.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 border border-slate-200">
        <PlugZap className="w-8 h-8 text-slate-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-800 mb-1">
            Connect biometric fingerprint sensor (Arduino)
          </p>
          <p className="text-xs text-slate-500">
            Connect your Arduino fingerprint module via USB. This tool will send commands like
            &quot;Register&quot; and &quot;Voting&quot; and wait for an ID such as &quot;FPID_23&quot; from the serial
            output.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <button
          type="button"
          onClick={connect}
          disabled={!!port || connecting}
          className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 transition"
        >
          {port ? 'Device connected' : connecting ? 'Connecting…' : 'Connect device'}
        </button>

        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          className="px-3 py-2 rounded-lg border border-slate-300 text-sm"
        >
          <option value="Register">Register (enroll)</option>
          <option value="Voting">Voting (verify)</option>
        </select>

        <button
          type="button"
          onClick={() => sendCommand(mode)}
          disabled={!port}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
        >
          Start {mode.toLowerCase()}
        </button>
      </div>

      <p className="text-xs text-slate-500">{status}</p>
    </div>
  );
}

