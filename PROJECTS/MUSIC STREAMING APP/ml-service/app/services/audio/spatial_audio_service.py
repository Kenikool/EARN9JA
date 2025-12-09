"""
Spatial Aupy.signal as signal
from scipy.fft import fft, ifft
import logging

logger = logging.getLogger(__name__)


class SpatialAudioService:
    
    def __init__(self):
        self.sample_rate = 48000
        self.hrtf_database = self._initialize_hrtf()
        logger.info("Spatial Audio Service initialized")
    
    def apply_spatial_audio(
        self,
        audio_data: np.ndarray,
        azimuth: float = 0.0,
        elevation: float = 0.0,
        distance: float = 1.0
    ) -> np.ndarray:
        if len(audio_data.shape) == 1:
            audio_data = np.column_stack([audio_data, audio_data])
        
        left_hrtf, right_hrtf = self._get_hrtf(azimuth, elevation)
        
        left_channel = signal.fftconvolve(audio_data[:, 0], left_hrtf, mode='same')
        right_channel = signal.fftconvolve(audio_data[:, 1], right_hrtf, mode='same')
        
        distance_attenuation = 1.0 / max(distance, 0.1)
        left_channel *= distance_attenuation
        right_channel *= distance_attenuation
        
        return np.column_stack([left_channel, right_channel])
    
    def apply_binaural_processing(
        self,
        audio_data: np.ndarray,
        head_width: float = 0.18
    ) -> np.ndarray:
        if len(audio_data.shape) == 1:
            audio_data = np.column_stack([audio_data, audio_data])
        
        speed_of_sound = 343.0
        itd_samples = int((head_width / speed_of_sound) * self.sample_rate)
        
        left_channel = audio_data[:, 0].copy()
        right_channel = audio_data[:, 1].copy()
        
        if itd_samples > 0:
            right_channel = np.pad(right_channel, (itd_samples, 0), mode='constant')[:len(left_channel)]
        
        left_filtered = self._apply_head_shadow(left_channel, 'left')
        right_filtered = self._apply_head_shadow(right_channel, 'right')
        
        return np.column_stack([left_filtered, right_filtered])
    
    def create_room_simulation(
        self,
        audio_data: np.ndarray,
        room_size: str = 'medium',
        reverb_amount: float = 0.3
    ) -> np.ndarray:
        room_params = {
            'small': {'delay': 0.02, 'decay': 0.3},
            'medium': {'delay': 0.05, 'decay': 0.5},
            'large': {'delay': 0.1, 'decay': 0.7},
            'hall': {'delay': 0.15, 'decay': 0.9}
        }
        
        params = room_params.get(room_size, room_params['medium'])
        
        delay_samples = int(params['delay'] * self.sample_rate)
        decay = params['decay']
        
        if len(audio_data.shape) == 1:
            audio_data = np.column_stack([audio_data, audio_data])
        
        reverb = np.zeros_like(audio_data)
        
        for i in range(1, 6):
            delay = delay_samples * i
            if delay < len(audio_data):
                gain = decay ** i
                reverb[delay:] += audio_data[:-delay] * gain
        
        wet = reverb * reverb_amount
        dry = audio_data * (1.0 - reverb_amount)
        
        return dry + wet
    
    def optimize_for_headphones(
        self,
        audio_data: np.ndarray,
        headphone_type: str = 'over_ear'
    ) -> np.ndarray:
        eq_curves = {
            'over_ear': {'low': 1.0, 'mid': 1.0, 'high': 0.9},
            'on_ear': {'low': 0.9, 'mid': 1.0, 'high': 0.95},
            'in_ear': {'low': 0.8, 'mid': 1.0, 'high': 1.1}
        }
        
        curve = eq_curves.get(headphone_type, eq_curves['over_ear'])
        
        if len(audio_data.shape) == 1:
            audio_data = np.column_stack([audio_data, audio_data])
        
        low_freq = self._apply_filter(audio_data, 'lowpass', 500)
        mid_freq = self._apply_filter(audio_data, 'bandpass', (500, 4000))
        high_freq = self._apply_filter(audio_data, 'highpass', 4000)
        
        result = (low_freq * curve['low'] + 
                 mid_freq * curve['mid'] + 
                 high_freq * curve['high'])
        
        return result
    
    def apply_3d_positioning(
        self,
        audio_data: np.ndarray,
        x: float,
        y: float,
        z: float
    ) -> np.ndarray:
        azimuth = np.arctan2(y, x) * 180 / np.pi
        distance = np.sqrt(x**2 + y**2 + z**2)
        elevation = np.arctan2(z, np.sqrt(x**2 + y**2)) * 180 / np.pi
        
        return self.apply_spatial_audio(audio_data, azimuth, elevation, distance)
    
    def _initialize_hrtf(self):
        angles = np.linspace(-90, 90, 37)
        hrtf_db = {}
        
        for angle in angles:
            left_hrtf = self._generate_simple_hrtf(angle, 'left')
            right_hrtf = self._generate_simple_hrtf(angle, 'right')
            hrtf_db[angle] = (left_hrtf, right_hrtf)
        
        return hrtf_db
    
    def _generate_simple_hrtf(self, angle: float, ear: str) -> np.ndarray:
        length = 128
        hrtf = np.zeros(length)
        
        if ear == 'left':
            if angle < 0:
                hrtf[0] = 1.0
                hrtf[1:10] = np.linspace(0.8, 0.2, 9)
            else:
                delay = int(abs(angle) / 90 * 10)
                if delay < length:
                    hrtf[delay] = 1.0 - abs(angle) / 180
        else:
            if angle > 0:
                hrtf[0] = 1.0
                hrtf[1:10] = np.linspace(0.8, 0.2, 9)
            else:
                delay = int(abs(angle) / 90 * 10)
                if delay < length:
                    hrtf[delay] = 1.0 - abs(angle) / 180
        
        return hrtf
    
    def _get_hrtf(self, azimuth: float, elevation: float):
        azimuth = np.clip(azimuth, -90, 90)
        
        angles = list(self.hrtf_database.keys())
        closest_angle = min(angles, key=lambda x: abs(x - azimuth))
        
        return self.hrtf_database[closest_angle]
    
    def _apply_head_shadow(self, audio: np.ndarray, ear: str) -> np.ndarray:
        nyquist = self.sample_rate / 2
        cutoff = 3000 / nyquist
        b, a = signal.butter(2, cutoff, btype='low')
        
        return signal.filtfilt(b, a, audio)
    
    def _apply_filter(self, audio: np.ndarray, filter_type: str, freq):
        nyquist = self.sample_rate / 2
        
        if filter_type == 'lowpass':
            b, a = signal.butter(4, freq / nyquist, btype='low')
        elif filter_type == 'highpass':
            b, a = signal.butter(4, freq / nyquist, btype='high')
        elif filter_type == 'bandpass':
            low, high = freq
            b, a = signal.butter(4, [low / nyquist, high / nyquist], btype='band')
        else:
            return audio
        
        if len(audio.shape) == 2:
            result = np.zeros_like(audio)
            for i in range(audio.shape[1]):
                result[:, i] = signal.filtfilt(b, a, audio[:, i])
            return result
        else:
            return signal.filtfilt(b, a, audio)


spatial_audio_service = SpatialAudioService()
