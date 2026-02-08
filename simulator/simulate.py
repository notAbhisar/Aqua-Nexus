"""
Aqua Nexus Simulator - Data Generation Engine
Generates realistic sensor telemetry data for urban, industrial, and rural water systems
"""

import requests
import time
import random
import math
from datetime import datetime
from typing import Dict, List, Optional
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class WaterSimulator:
    """
    Simulates water sensor telemetry data with context-aware patterns
    """
    
    def __init__(self, api_base_url: str = "http://localhost:8000"):
        self.api_url = api_base_url
        self.nodes = {}
        self.running = False
        self.telemetry_count = 0
        
    def fetch_nodes(self) -> bool:
        """Fetch available sensor nodes from the API"""
        try:
            response = requests.get(f"{self.api_url}/api/nodes")
            if response.status_code == 200:
                self.nodes = {node['id']: node for node in response.json()}
                logger.info(f"Fetched {len(self.nodes)} sensor nodes")
                return True
            else:
                logger.error(f"Failed to fetch nodes: {response.status_code}")
                return False
        except requests.exceptions.ConnectionError:
            logger.error(f"Cannot connect to API at {self.api_url}")
            return False
        except Exception as e:
            logger.error(f"Error fetching nodes: {str(e)}")
            return False
    
    def generate_urban_telemetry(self, node_id: int) -> Dict:
        """
        Generate urban water system telemetry
        - Flow rate: High during peak hours (6-9 AM, 5-8 PM), low at night
        - Pressure: Stable 60-70 PSI, occasionally drops to simulate leaks
        - Temperature: Stable around 20-23°C
        - pH: Neutral 7.0-7.5
        - Turbidity: Low 2-5 NTU
        """
        now = datetime.now()
        hour = now.hour
        
        # Peak hours: 6-9 AM and 5-8 PM
        is_peak = (6 <= hour < 9) or (17 <= hour < 20)
        
        # Flow rate: 40-60 L/s during peak, 15-25 L/s otherwise
        if is_peak:
            flow_rate = random.uniform(40, 60) + random.gauss(0, 2)
        else:
            flow_rate = random.uniform(15, 25) + random.gauss(0, 1)
        
        # Occasional drop to simulate a leak (5% chance)
        if random.random() < 0.05:
            flow_rate = random.uniform(5, 15)  # Critical drop
        
        flow_rate = max(5, flow_rate)  # Ensure positive
        
        # Pressure: Usually 65 PSI, occasionally drops
        pressure = random.uniform(62, 68)
        if random.random() < 0.08:  # 8% chance of pressure drop
            pressure = random.uniform(30, 45)  # Leak simulation
        
        return {
            "node_id": node_id,
            "flow_rate": round(flow_rate, 2),
            "pressure": round(pressure, 2),
            "ph_level": round(random.uniform(7.0, 7.5), 2),
            "temperature": round(random.uniform(20, 23), 2),
            "turbidity": round(random.uniform(2, 5), 2)
        }
    
    def generate_industrial_telemetry(self, node_id: int) -> Dict:
        """
        Generate industrial water system telemetry
        - pH: Normally 6.5-8.5, occasionally spikes to 11.0 (pollution/chemical dump)
        - Flow rate: Stable around 100 L/s
        - Pressure: High 80-90 PSI (industrial pressure)
        - Temperature: Higher due to industrial processes 35-45°C
        - Turbidity: Variable 10-20 NTU
        """
        # pH: Usually normal, occasionally spike to dangerous levels
        if random.random() < 0.10:  # 10% chance of anomaly
            ph_level = random.uniform(10.5, 11.5)  # Contamination alert!
            logger.warning(f"🚨 INDUSTRIAL ANOMALY: Node {node_id} pH spike detected!")
        else:
            ph_level = random.uniform(6.5, 8.5)
        
        return {
            "node_id": node_id,
            "flow_rate": round(random.uniform(95, 105) + random.gauss(0, 2), 2),
            "pressure": round(random.uniform(80, 90), 2),
            "ph_level": round(ph_level, 2),
            "temperature": round(random.uniform(35, 45), 2),
            "turbidity": round(random.uniform(10, 20), 2)
        }
    
    def generate_rural_telemetry(self, node_id: int) -> Dict:
        """
        Generate rural water system telemetry
        - Flow rate: Low but stable 5-15 L/s
        - Pressure: Pressure tank system 40-50 PSI
        - pH: Natural groundwater 7.5-8.0
        - Temperature: Ground temperature stable 15-18°C
        - Turbidity: Variable due to wells 5-15 NTU
        - Aquifer depth: 60-100 meters (normally), occasional drops
        - Recharge rate: 8-12 mm/month (normally), occasional drops during drought
        """
        # Aquifer depth: usually 70-90m, occasionally drops to simulate drought
        if random.random() < 0.15:  # 15% chance of low aquifer
            aquifer_depth = random.uniform(50, 65)  # Warning/Critical zone
        else:
            aquifer_depth = random.uniform(70, 95)  # Normal
        
        # Recharge rate: usually 9-11 mm/month, occasionally drops
        if random.random() < 0.10:  # 10% chance of low recharge
            recharge_rate = random.uniform(2, 4)  # Critical
        else:
            recharge_rate = random.uniform(8, 12)  # Normal
        
        return {
            "node_id": node_id,
            "flow_rate": round(random.uniform(5, 15), 2),
            "pressure": round(random.uniform(40, 50), 2),
            "ph_level": round(random.uniform(7.5, 8.0), 2),
            "temperature": round(random.uniform(15, 18), 2),
            "turbidity": round(random.uniform(5, 15), 2),
            "aquifer_depth_m": round(aquifer_depth, 1),
            "recharge_rate": round(recharge_rate, 2)
        }
    
    def generate_telemetry(self, node_id: int, node_type: str) -> Dict:
        """Generate telemetry based on node type"""
        if node_type == "urban":
            return self.generate_urban_telemetry(node_id)
        elif node_type == "industrial":
            return self.generate_industrial_telemetry(node_id)
        elif node_type == "rural":
            return self.generate_rural_telemetry(node_id)
        else:
            # Default to urban
            return self.generate_urban_telemetry(node_id)
    
    def submit_telemetry(self, data: Dict) -> bool:
        """Submit telemetry data to the API"""
        try:
            response = requests.post(
                f"{self.api_url}/api/telemetry",
                json=data,
                timeout=5
            )
            
            if response.status_code == 201:
                self.telemetry_count += 1
                return True
            else:
                logger.warning(f"Failed to submit telemetry: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error submitting telemetry: {str(e)}")
            return False
    
    def simulate_cycle(self):
        """Run one simulation cycle for all nodes"""
        successful = 0
        failed = 0
        
        for node_id, node in self.nodes.items():
            telemetry = self.generate_telemetry(
                node_id,
                node.get('node_type', 'urban')
            )
            
            if self.submit_telemetry(telemetry):
                successful += 1
                logger.debug(f"✓ Node {node_id}: {node['name']}")
            else:
                failed += 1
        
        if successful > 0:
            logger.info(f"Submitted {successful} readings (Failed: {failed})")
    
    def run(self, interval: int = 2, cycles: Optional[int] = None):
        """
        Run the simulator
        
        Args:
            interval: Seconds between simulation cycles (default: 2)
            cycles: Number of cycles to run (default: None = infinite)
        """
        if not self.fetch_nodes():
            logger.error("Failed to initialize simulator")
            return
        
        if not self.nodes:
            logger.error("No nodes available to simulate")
            return
        
        self.running = True
        cycle_count = 0
        
        logger.info(f"Starting simulation with {len(self.nodes)} nodes")
        logger.info(f"Interval: {interval} seconds, Cycles: {cycles or 'infinite'}")
        logger.info("Press Ctrl+C to stop")
        
        try:
            while self.running:
                if cycles and cycle_count >= cycles:
                    break
                
                cycle_count += 1
                timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                logger.info(f"[Cycle {cycle_count}] {timestamp}")
                
                self.simulate_cycle()
                
                if not (cycles and cycle_count >= cycles):
                    time.sleep(interval)
        
        except KeyboardInterrupt:
            logger.info("\nSimulation stopped by user")
        
        except Exception as e:
            logger.error(f"Simulation error: {str(e)}")
        
        finally:
            self.running = False
            logger.info(f"Total telemetry records submitted: {self.telemetry_count}")


def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Aqua Nexus Water Simulation Engine'
    )
    parser.add_argument(
        '--url',
        default='http://localhost:8000',
        help='API base URL (default: http://localhost:8000)'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=2,
        help='Seconds between simulation cycles (default: 2)'
    )
    parser.add_argument(
        '--cycles',
        type=int,
        default=None,
        help='Number of cycles to run (default: infinite)'
    )
    
    args = parser.parse_args()
    
    simulator = WaterSimulator(api_base_url=args.url)
    simulator.run(interval=args.interval, cycles=args.cycles)


if __name__ == "__main__":
    main()
